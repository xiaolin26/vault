/**
 * Keychain - Keychain operations
 *
 * Uses keytar for cross-platform keychain access
 */
/**
 * Save encrypted master key to keychain
 */
export declare function saveMasterKey(encryptedKey: string): Promise<void>;
/**
 * Get encrypted master key from keychain
 */
export declare function getMasterKey(): Promise<string | null>;
/**
 * Delete master key
 */
export declare function deleteMasterKey(): Promise<boolean>;
/**
 * Save salt
 */
export declare function saveSalt(salt: string): Promise<void>;
/**
 * Get salt
 */
export declare function getSalt(): Promise<string | null>;
/**
 * Check if keychain is available
 */
export declare function isKeychainAvailable(): Promise<boolean>;
//# sourceMappingURL=Keychain.d.ts.map