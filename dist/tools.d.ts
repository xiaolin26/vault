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
export declare class VaultNotInitializedError extends Error {
    constructor();
}
export declare class SecretNotFoundError extends Error {
    constructor(key: string);
}
export interface VaultConfig {
    userId: string;
    passphrase: string;
}
/**
 * Initialize Vault
 */
export declare function initVault(userId: string, passphrase: string): Promise<{
    success: boolean;
    message: string;
    storagePath?: string;
}>;
/**
 * Get secret
 */
export declare function getSecret(key: string, passphrase: string): Promise<string>;
/**
 * Set secret
 */
export declare function setSecret(key: string, value: string, passphrase: string, description?: string): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * List all secrets
 */
export declare function listSecrets(passphrase: string): Promise<Array<{
    key: string;
    description: string;
}>>;
/**
 * Delete secret
 */
export declare function deleteSecret(key: string, passphrase: string): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Get Vault status
 */
export declare function getVaultStatus(): Promise<{
    initialized: boolean;
    storageType: 'icloud' | 'local' | 'unknown';
    userId?: string;
    secretCount: number;
    isNewVersion: boolean;
}>;
/**
 * Reset Vault
 */
export declare function resetVault(): Promise<{
    success: boolean;
    message: string;
}>;
//# sourceMappingURL=tools.d.ts.map