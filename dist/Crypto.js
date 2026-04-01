/**
 * Crypto - AES-256-GCM encryption/decryption
 *
 * Uses Web Crypto API for encryption operations
 */
const ENCRYPTION_ALGO = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const ITERATIONS = 100000;
/**
 * Derive encryption key from passphrase
 */
export async function deriveKey(passphrase, salt) {
    const encoder = new TextEncoder();
    const passphraseBuffer = encoder.encode(passphrase);
    const baseKey = await crypto.subtle.importKey('raw', passphraseBuffer, 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({
        name: 'PBKDF2',
        salt: salt,
        iterations: ITERATIONS,
        hash: 'SHA-256',
    }, baseKey, { name: ENCRYPTION_ALGO, length: KEY_LENGTH }, false, ['encrypt', 'decrypt']);
}
/**
 * Encrypt data
 */
export async function encrypt(plaintext, passphrase) {
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    // Derive key
    const key = await deriveKey(passphrase, salt);
    // Encrypt
    const encoder = new TextEncoder();
    const plaintextBuffer = encoder.encode(plaintext);
    const ciphertext = await crypto.subtle.encrypt({ name: ENCRYPTION_ALGO, iv }, key, plaintextBuffer);
    // Extract auth tag (GCM mode: last 16 bytes is the tag)
    const ciphertextArray = new Uint8Array(ciphertext);
    const authTag = ciphertextArray.slice(-16);
    const actualCiphertext = ciphertextArray.slice(0, -16);
    return {
        encrypted: {
            iv: bufferToHex(iv),
            ciphertext: bufferToBase64(actualCiphertext),
            authTag: bufferToHex(authTag),
        },
        salt: bufferToHex(salt),
    };
}
/**
 * Decrypt data
 */
export async function decrypt(encrypted, salt, passphrase) {
    try {
        // Parse input
        const iv = hexToBuffer(encrypted.iv);
        const authTag = hexToBuffer(encrypted.authTag);
        const ciphertext = base64ToBuffer(encrypted.ciphertext);
        const saltBuffer = hexToBuffer(salt);
        // Derive key
        const key = await deriveKey(passphrase, saltBuffer);
        // Reconstruct ciphertext (actual ciphertext + auth tag)
        const combined = new Uint8Array(ciphertext.length + authTag.length);
        combined.set(ciphertext);
        combined.set(authTag, ciphertext.length);
        // Decrypt
        const decrypted = await crypto.subtle.decrypt({ name: ENCRYPTION_ALGO, iv }, key, combined);
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    }
    catch (error) {
        // Distinguish error types
        if (error instanceof DOMException) {
            if (error.name === 'OperationError') {
                throw new VaultError('DECRYPTION_FAILED', 'Decryption failed: incorrect passphrase or corrupted data');
            }
        }
        throw error;
    }
}
/**
 * Vault error class
 */
export class VaultError extends Error {
    code;
    cause;
    constructor(code, message, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'VaultError';
    }
}
// ============================================================================
// Utility functions
// ============================================================================
function bufferToHex(buffer) {
    return Array.from(buffer)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
function hexToBuffer(hex) {
    const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
    if (cleanHex.length % 2 !== 0) {
        throw new VaultError('INVALID_HEX', 'Invalid hex string');
    }
    const pairs = cleanHex.match(/.{1,2}/g) || [];
    return new Uint8Array(pairs.map(p => parseInt(p, 16)));
}
function bufferToBase64(buffer) {
    const binary = Array.from(buffer)
        .map(b => String.fromCharCode(b))
        .join('');
    return btoa(binary);
}
function base64ToBuffer(base64) {
    const binary = atob(base64);
    return new Uint8Array(Array.from(binary).map(c => c.charCodeAt(0)));
}
/**
 * Validate passphrase format
 */
export function validatePassphrase(passphrase) {
    if (!passphrase || passphrase.length < 8) {
        throw new VaultError('INVALID_PASSPHRASE', 'Passphrase must be at least 8 characters');
    }
}
/**
 * Generate random salt
 */
export function generateSalt() {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    return bufferToHex(salt);
}
//# sourceMappingURL=Crypto.js.map