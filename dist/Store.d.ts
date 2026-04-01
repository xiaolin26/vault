/**
 * Store - Data storage
 *
 * Handles iCloud and local storage
 */
export interface StoredData {
    version: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    secrets: Record<string, SecretEntry>;
}
export interface SecretEntry {
    value: string;
    description: string;
    created_at: string;
    updated_at: string;
}
export interface StorageLocation {
    path: string;
    type: 'icloud' | 'local';
}
/**
 * Detect and get best storage location
 */
export declare function getStorageLocation(): Promise<StorageLocation>;
/**
 * Read stored data
 */
export declare function readStore(): Promise<StoredData | null>;
/**
 * Write stored data
 */
export declare function writeStore(data: StoredData): Promise<void>;
/**
 * Initialize storage
 */
export declare function initStore(userId: string): Promise<StoredData>;
/**
 * Get storage location info
 */
export declare function getStorageInfo(): Promise<{
    type: 'icloud' | 'local';
    path: string;
    available: boolean;
}>;
//# sourceMappingURL=Store.d.ts.map