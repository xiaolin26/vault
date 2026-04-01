/**
 * Store - Data storage
 *
 * Handles iCloud and local storage
 */
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
// iCloud path (macOS)
const ICLOUD_BASE = join(homedir(), 'Library', 'Mobile Documents', 'com~apple~CloudDocs');
// Local fallback path
const LOCAL_BASE = join(homedir(), '.vault');
// Data directory and file
const VAULT_DIR = '.vault-data';
const SECRETS_FILE = 'secrets.json';
/**
 * Detect and get best storage location
 */
export async function getStorageLocation() {
    // Prefer iCloud
    if (existsSync(ICLOUD_BASE)) {
        return {
            path: join(ICLOUD_BASE, VAULT_DIR),
            type: 'icloud',
        };
    }
    // Fallback to local
    return {
        path: join(LOCAL_BASE, VAULT_DIR),
        type: 'local',
    };
}
/**
 * Get full data file path
 */
async function getDataFilePath() {
    const location = await getStorageLocation();
    return join(location.path, SECRETS_FILE);
}
/**
 * Ensure directory exists
 */
async function ensureDir(filePath) {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true, mode: 0o700 });
    }
}
/**
 * Read stored data
 */
export async function readStore() {
    try {
        const filePath = await getDataFilePath();
        if (!existsSync(filePath)) {
            return null;
        }
        const content = await readFile(filePath, 'utf-8');
        return JSON.parse(content);
    }
    catch {
        return null;
    }
}
/**
 * Write stored data
 */
export async function writeStore(data) {
    const filePath = await getDataFilePath();
    await ensureDir(filePath);
    // Update timestamp
    data.updated_at = new Date().toISOString();
    const content = JSON.stringify(data, null, 2);
    await writeFile(filePath, content, { mode: 0o600, encoding: 'utf-8' });
}
/**
 * Initialize storage
 */
export async function initStore(userId) {
    const location = await getStorageLocation();
    const data = {
        version: '1.0',
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        secrets: {},
    };
    await writeStore(data);
    return data;
}
/**
 * Get storage location info
 */
export async function getStorageInfo() {
    const location = await getStorageLocation();
    return {
        type: location.type,
        path: location.path,
        available: existsSync(location.path),
    };
}
//# sourceMappingURL=Store.js.map