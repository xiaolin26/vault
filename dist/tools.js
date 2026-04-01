/**
 * Tools - Secret operations
 *
 * Core functions for AI to call
 *
 * NEW ARCHITECTURE for multi-device sync:
 * - Master key is derived from passphrase + vault salt (stored in data file)
 * - Same passphrase = same master key on all devices
 * - No keychain dependency for the master key
 */
import { decrypt, deriveKey, encrypt, generateSalt, validatePassphrase, } from './Crypto.js';
import { readStore, writeStore, } from './Store.js';
// ============================================================================
// Constants
// ============================================================================
// Vault salt is stored in the data file and shared across devices
// This allows same passphrase to derive same master key on all devices
const VAULT_SALT_KEY = '_vault_salt';
// ============================================================================
// Error types
// ============================================================================
export class VaultNotInitializedError extends Error {
    constructor() {
        super('Vault is not initialized. Please run: vault init');
        this.name = 'VaultNotInitializedError';
    }
}
export class SecretNotFoundError extends Error {
    constructor(key) {
        super(`Secret "${key}" not found`);
        this.name = 'SecretNotFoundError';
    }
}
// ============================================================================
// Vault Salt Management
// ============================================================================
/**
 * Get or create vault salt (stored in data file, shared across devices)
 */
async function getOrCreateVaultSalt() {
    const store = await readStore();
    if (store && store.secrets[VAULT_SALT_KEY]) {
        // Existing vault has salt
        const parsed = JSON.parse(store.secrets[VAULT_SALT_KEY].value);
        return parsed.salt;
    }
    // Create new vault salt
    return generateSalt();
}
/**
 * Derive master key from passphrase and vault salt
 */
async function deriveMasterKey(passphrase, salt) {
    const saltBuffer = Buffer.from(salt, 'hex');
    return deriveKey(passphrase, saltBuffer);
}
/**
 * Initialize Vault
 */
export async function initVault(userId, passphrase) {
    try {
        validatePassphrase(passphrase);
        // Check if already exists
        const store = await readStore();
        if (store && store.secrets[VAULT_SALT_KEY]) {
            return {
                success: false,
                message: 'Vault already exists. To reinitialize, run: vault reset',
            };
        }
        // Generate vault salt (shared across devices)
        const vaultSalt = generateSalt();
        // Get storage location
        const { getStorageLocation } = await import('./Store.js');
        const location = await getStorageLocation();
        // Initialize storage with vault salt
        const newData = {
            version: '2.0', // New version with synced master key
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            secrets: {
                [VAULT_SALT_KEY]: {
                    value: JSON.stringify({ salt: vaultSalt }),
                    description: 'Vault salt (do not delete)',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            },
        };
        await writeStore(newData);
        return {
            success: true,
            message: `Vault initialized successfully! User: ${userId}`,
            storagePath: location.path,
        };
    }
    catch (error) {
        return {
            success: false,
            message: `Initialization failed: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}
/**
 * Get secret
 */
export async function getSecret(key, passphrase) {
    // Read store
    const store = await readStore();
    if (!store || !store.secrets[VAULT_SALT_KEY]) {
        throw new VaultNotInitializedError();
    }
    // Get vault salt
    const vaultSaltData = store.secrets[VAULT_SALT_KEY];
    const vaultSalt = JSON.parse(vaultSaltData.value).salt;
    // Get secret
    const entry = store.secrets[key];
    if (!entry) {
        throw new SecretNotFoundError(key);
    }
    // Decrypt secret value (each secret has its own salt)
    const parsed = JSON.parse(entry.value);
    return await decrypt(parsed.encrypted, parsed.salt, passphrase);
}
/**
 * Set secret
 */
export async function setSecret(key, value, passphrase, description) {
    try {
        // Validate input
        if (!key || key.trim().length === 0) {
            return { success: false, message: 'Key name cannot be empty' };
        }
        if (!value || value.trim().length === 0) {
            return { success: false, message: 'Secret value cannot be empty' };
        }
        // Read store
        let store = await readStore();
        if (!store || !store.secrets[VAULT_SALT_KEY]) {
            throw new VaultNotInitializedError();
        }
        // Get vault salt
        const vaultSaltData = store.secrets[VAULT_SALT_KEY];
        const vaultSalt = JSON.parse(vaultSaltData.value).salt;
        // Derive master key
        const masterKey = await deriveMasterKey(passphrase, vaultSalt);
        // Encrypt secret value with the passphrase (encrypt function derives key internally)
        const encrypted = await encrypt(value, passphrase);
        // Update secret
        const now = new Date().toISOString();
        const isNew = !store.secrets[key];
        store.secrets[key] = {
            value: JSON.stringify(encrypted),
            description: description || '',
            created_at: isNew ? now : store.secrets[key].created_at,
            updated_at: now,
        };
        // Write store
        await writeStore(store);
        return {
            success: true,
            message: isNew ? `Saved: ${key}` : `Updated: ${key}`,
        };
    }
    catch (error) {
        if (error instanceof VaultNotInitializedError) {
            throw error;
        }
        return {
            success: false,
            message: `Save failed: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}
/**
 * List all secrets
 */
export async function listSecrets(passphrase) {
    // Read store
    const store = await readStore();
    if (!store || !store.secrets[VAULT_SALT_KEY]) {
        throw new VaultNotInitializedError();
    }
    // Verify passphrase by deriving master key
    const vaultSaltData = store.secrets[VAULT_SALT_KEY];
    const vaultSalt = JSON.parse(vaultSaltData.value).salt;
    await deriveMasterKey(passphrase, vaultSalt);
    // Return list of secret names (without vault salt, without values)
    return Object.entries(store.secrets)
        .filter(([key]) => key !== VAULT_SALT_KEY)
        .map(([key, entry]) => ({
        key,
        description: entry.description || '',
    }));
}
/**
 * Delete secret
 */
export async function deleteSecret(key, passphrase) {
    try {
        // Verify passphrase
        const store = await readStore();
        if (!store || !store.secrets[VAULT_SALT_KEY]) {
            throw new VaultNotInitializedError();
        }
        const vaultSaltData = store.secrets[VAULT_SALT_KEY];
        const vaultSalt = JSON.parse(vaultSaltData.value).salt;
        await deriveMasterKey(passphrase, vaultSalt);
        // Check if secret exists
        if (!store.secrets[key]) {
            return { success: false, message: `Secret "${key}" not found` };
        }
        // Delete secret
        delete store.secrets[key];
        await writeStore(store);
        return { success: true, message: `Deleted: ${key}` };
    }
    catch (error) {
        if (error instanceof VaultNotInitializedError) {
            throw error;
        }
        return {
            success: false,
            message: `Delete failed: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}
/**
 * Get Vault status
 */
export async function getVaultStatus() {
    const store = await readStore();
    const { getStorageInfo } = await import('./Store.js');
    const storageInfo = await getStorageInfo();
    const hasVaultSalt = store !== null && VAULT_SALT_KEY in store.secrets;
    return {
        initialized: store !== null,
        storageType: storageInfo.type,
        userId: store?.user_id,
        secretCount: store ? Object.keys(store.secrets).length - (hasVaultSalt ? 1 : 0) : 0,
        isNewVersion: hasVaultSalt,
    };
}
/**
 * Reset Vault
 */
export async function resetVault() {
    try {
        const { readFile, writeFile } = await import('fs/promises');
        const { existsSync } = await import('fs');
        const { join } = await import('path');
        const { getStorageLocation } = await import('./Store.js');
        const location = await getStorageLocation();
        const dataFile = join(location.path, 'secrets.json');
        if (existsSync(dataFile)) {
            // Secure wipe: overwrite with random data multiple times before deleting
            const { unlink } = await import('fs/promises');
            try {
                // Read file size
                const { statSync } = await import('fs');
                const fileSize = statSync(dataFile).size;
                // Overwrite 3 times with random data
                for (let i = 0; i < 3; i++) {
                    const randomData = crypto.getRandomValues(new Uint8Array(fileSize));
                    await writeFile(dataFile, Buffer.from(randomData));
                }
                // Finally delete the file
                await unlink(dataFile);
            }
            catch {
                // If secure wipe fails, fall back to simple overwrite
                await writeFile(dataFile, '', 'utf-8');
            }
        }
        return {
            success: true,
            message: 'Vault has been securely reset. Run "vault init" to set up again.',
        };
    }
    catch {
        return {
            success: false,
            message: 'Reset failed',
        };
    }
}
//# sourceMappingURL=tools.js.map