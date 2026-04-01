/**
 * Keychain - Keychain operations
 *
 * Uses keytar for cross-platform keychain access
 */
import keytar from 'keytar';
const SERVICE_NAME = 'vault-skill';
const ACCOUNT_KEY = 'master-key';
const ACCOUNT_SALT = 'salt';
/**
 * Save encrypted master key to keychain
 */
export async function saveMasterKey(encryptedKey) {
    await keytar.setPassword(SERVICE_NAME, ACCOUNT_KEY, encryptedKey);
}
/**
 * Get encrypted master key from keychain
 */
export async function getMasterKey() {
    return await keytar.getPassword(SERVICE_NAME, ACCOUNT_KEY);
}
/**
 * Delete master key
 */
export async function deleteMasterKey() {
    return await keytar.deletePassword(SERVICE_NAME, ACCOUNT_KEY);
}
/**
 * Save salt
 */
export async function saveSalt(salt) {
    await keytar.setPassword(SERVICE_NAME, ACCOUNT_SALT, salt);
}
/**
 * Get salt
 */
export async function getSalt() {
    return await keytar.getPassword(SERVICE_NAME, ACCOUNT_SALT);
}
/**
 * Check if keychain is available
 */
export async function isKeychainAvailable() {
    try {
        // Try a simple operation to detect availability
        await keytar.getPassword(SERVICE_NAME, '__test__');
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=Keychain.js.map