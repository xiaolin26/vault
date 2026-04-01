/**
 * Crypto - AES-256-GCM encryption/decryption
 *
 * Uses Web Crypto API for encryption operations
 */
export interface EncryptedData {
    iv: string;
    ciphertext: string;
    authTag: string;
}
export interface EncryptionResult {
    encrypted: EncryptedData;
    salt: string;
}
/**
 * Derive encryption key from passphrase
 */
export declare function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey>;
/**
 * Encrypt data
 */
export declare function encrypt(plaintext: string, passphrase: string): Promise<EncryptionResult>;
/**
 * Decrypt data
 */
export declare function decrypt(encrypted: EncryptedData, salt: string, passphrase: string): Promise<string>;
/**
 * Vault error class
 */
export declare class VaultError extends Error {
    code: string;
    cause?: Error | undefined;
    constructor(code: string, message: string, cause?: Error | undefined);
}
/**
 * Validate passphrase format
 */
export declare function validatePassphrase(passphrase: string): void;
/**
 * Generate random salt
 */
export declare function generateSalt(): string;
//# sourceMappingURL=Crypto.d.ts.map