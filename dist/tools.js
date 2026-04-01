/**
 * Tools - Secret operations
 *
 * Core functions for AI to call
 */
import { decrypt, encrypt, generateSalt, validatePassphrase, } from './Crypto.js';
import { deleteMasterKey, getMasterKey, saveMasterKey, saveSalt, } from './Keychain.js';
import { initStore, readStore, writeStore, } from './Store.js';
// ============================================================================
// Error types
// ============================================================================
export class VaultNotInitializedError extends Error {
    constructor() {
        super('Vault is not initialized. Please run: vault init <username>');
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
// Utility functions
// ============================================================================
/**
 * Decrypt master key
 */
async function decryptMasterKey(encryptedKey, passphrase) {
    try {
        const parsed = JSON.parse(encryptedKey);
        return await decrypt(parsed.encrypted, parsed.salt, passphrase);
    }
    catch {
        throw new Error('Incorrect passphrase or corrupted master key');
    }
}
/**
 * Encrypt master key
 */
async function encryptMasterKey(masterKey, passphrase) {
    const result = await encrypt(masterKey, passphrase);
    return JSON.stringify(result);
}
/**
 * Initialize Vault
 */
export async function initVault(userId, passphrase) {
    try {
        validatePassphrase(passphrase);
        // Check if already exists
        const existingKey = await getMasterKey();
        if (existingKey) {
            return {
                success: false,
                message: 'Vault already exists. To reinitialize, run: vault reset',
            };
        }
        // Generate master key and salt
        const masterKey = generateSalt();
        const salt = generateSalt();
        // Encrypt master key
        const encryptedKey = await encryptMasterKey(masterKey, passphrase);
        // Save to keychain
        await saveMasterKey(encryptedKey);
        await saveSalt(salt);
        // Initialize storage and get path
        const { getStorageLocation } = await import('./Store.js');
        const location = await getStorageLocation();
        await initStore(userId);
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
    // Get encrypted master key
    const encryptedKey = await getMasterKey();
    if (!encryptedKey) {
        throw new VaultNotInitializedError();
    }
    // Decrypt master key
    const masterKey = await decryptMasterKey(encryptedKey, passphrase);
    // Read store
    const store = await readStore();
    if (!store) {
        throw new VaultNotInitializedError();
    }
    // Get secret
    const entry = store.secrets[key];
    if (!entry) {
        throw new SecretNotFoundError(key);
    }
    // Decrypt secret value
    const parsed = JSON.parse(entry.value);
    return await decrypt(parsed.encrypted, parsed.salt, masterKey);
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
        // Get encrypted master key
        const encryptedKey = await getMasterKey();
        if (!encryptedKey) {
            throw new VaultNotInitializedError();
        }
        // Decrypt master key
        const masterKey = await decryptMasterKey(encryptedKey, passphrase);
        // Encrypt secret value
        const encrypted = await encrypt(value, masterKey);
        // Read store
        let store = await readStore();
        if (!store) {
            throw new VaultNotInitializedError();
        }
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
    // Get encrypted master key
    const encryptedKey = await getMasterKey();
    if (!encryptedKey) {
        throw new VaultNotInitializedError();
    }
    // Decrypt master key
    await decryptMasterKey(encryptedKey, passphrase);
    // Read store
    const store = await readStore();
    if (!store) {
        throw new VaultNotInitializedError();
    }
    // Return list of secret names (without values)
    return Object.entries(store.secrets).map(([key, entry]) => ({
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
        const encryptedKey = await getMasterKey();
        if (!encryptedKey) {
            throw new VaultNotInitializedError();
        }
        await decryptMasterKey(encryptedKey, passphrase);
        // Read store
        const store = await readStore();
        if (!store) {
            throw new VaultNotInitializedError();
        }
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
    const encryptedKey = await getMasterKey();
    const store = await readStore();
    const { getStorageInfo } = await import('./Store.js');
    const storageInfo = await getStorageInfo();
    return {
        initialized: !!encryptedKey && !!store,
        storageType: storageInfo.type,
        userId: store?.user_id,
        secretCount: store ? Object.keys(store.secrets).length : 0,
    };
}
/**
 * Reset Vault
 */
export async function resetVault() {
    try {
        await deleteMasterKey();
        return {
            success: true,
            message: 'Vault has been reset. All keys deleted, but encrypted data files still exist in storage.',
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