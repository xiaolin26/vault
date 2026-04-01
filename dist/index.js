#!/usr/bin/env bun
/**
 * Vault CLI - Command line entry point
 *
 * Usage: vault <command> [args]
 */
import { existsSync, mkdirSync, symlinkSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { deleteSecret, getSecret, getVaultStatus, initVault, listSecrets, resetVault, setSecret, } from './tools.js';
import { checkInitialized, confirm, error, info, password, question, runSetup, showStatusSummary, showWelcome, success, } from './CLI.js';
// Get package directory
const __filename = fileURLToPath(import.meta.url);
const PKG_DIR = dirname(__filename);
/**
 * Ensure Claude Code skill link exists
 * Run silently, only show message on first creation
 */
let skillLinkJustCreated = false;
function ensureSkillLink() {
    try {
        const skillsDir = join(process.env.HOME || '', '.claude', 'skills');
        const linkPath = join(skillsDir, 'vault');
        // Check if link already exists
        if (existsSync(linkPath)) {
            return;
        }
        // Create skills directory
        if (!existsSync(skillsDir)) {
            mkdirSync(skillsDir, { recursive: true });
        }
        // Create symbolic link
        symlinkSync(PKG_DIR, linkPath);
        skillLinkJustCreated = true;
    }
    catch {
        // Silently fail - don't break anything
    }
}
/**
 * Show help
 */
function showHelp() {
    console.log(`
🔐 Vault - AI-Powered Secret Management

Usage: vault <command> [args]

Commands:
  (none)               Interactive mode (default)
  init                 Initialize Vault (guided setup)
  get <key>            Get a secret
  set <key> [value]    Set a secret (reads from stdin if no value)
  list                 List all secrets
  delete <key>         Delete a secret
  status               Check Vault status
  reset                Reset Vault (⚠️ deletes all data)

Options:
  -d, --description    Secret description (for set command)

Examples:
  vault                    # Interactive mode
  vault init               # Guided setup
  vault set openai_key     # Will prompt for value
  vault get openai_key
  vault list
`);
}
/**
 * Handle init command
 */
async function handleInit(username) {
    // Check if already initialized
    const isInitialized = await checkInitialized();
    if (isInitialized) {
        const reset = await confirm('Vault is already initialized. Do you want to reset and start over?');
        if (!reset) {
            info('Vault already set up. Use "vault status" to check.');
            return;
        }
        const sure = await confirm('This will delete all your secrets. Are you sure?');
        if (!sure) {
            info('Cancelled.');
            return;
        }
        await resetVault();
        info('Vault has been reset.');
    }
    let setupUsername;
    let setupPassphrase;
    if (username) {
        // Non-interactive mode (backward compatible)
        console.log('Set a new passphrase (at least 8 characters)');
        const passphrase1 = await password('Passphrase: ');
        if (passphrase1.length < 8) {
            error('Passphrase must be at least 8 characters');
            process.exit(1);
        }
        const passphrase2 = await password('Confirm: ');
        if (passphrase1 !== passphrase2) {
            error('Passphrases do not match');
            process.exit(1);
        }
        setupUsername = username;
        setupPassphrase = passphrase1;
    }
    else {
        // Interactive guided setup
        const setup = await runSetup();
        setupUsername = setup.username;
        setupPassphrase = setup.passphrase;
    }
    const result = await initVault(setupUsername, setupPassphrase);
    if (result.success) {
        success('Vault initialized successfully!');
        info(`Your secrets are stored in: ${result.storagePath}`);
        info('Use "vault set <key>" to add your first secret.');
    }
    else {
        error(result.message);
    }
    process.exit(result.success ? 0 : 1);
}
/**
 * Handle get command
 */
async function handleGet(key) {
    const passphrase = await password('Passphrase: ');
    const value = await getSecret(key, passphrase);
    console.log(value);
}
/**
 * Handle set command
 */
async function handleSet(args) {
    const key = args[0];
    if (!key) {
        error('Please provide a key name');
        console.error('Usage: vault set <key> [value]');
        console.error('Usage: echo "secret" | vault set <key>');
        process.exit(1);
    }
    // Parse options
    let value = args[1];
    let description = '';
    for (let i = 1; i < args.length; i++) {
        if (args[i] === '-d' || args[i] === '--description') {
            description = args[i + 1] || '';
            i++;
        }
    }
    // Check if value is piped from stdin
    const stdin = process.stdin;
    const isPiped = !stdin.isTTY;
    if (isPiped) {
        // Read from pipe
        value = await new Promise((resolve) => {
            let data = '';
            stdin.on('data', (chunk) => {
                data += chunk;
            });
            stdin.on('end', () => {
                resolve(data.trim());
            });
            stdin.resume();
        });
    }
    else if (!value) {
        // No value provided, prompt for it
        value = await question('Secret value: ');
    }
    const passphrase = await password('Passphrase: ');
    const result = await setSecret(key, value, passphrase, description);
    if (result.success) {
        success(result.message);
    }
    else {
        error(result.message);
    }
    process.exit(result.success ? 0 : 1);
}
/**
 * Handle list command
 */
async function handleList() {
    const passphrase = await password('Passphrase: ');
    const secrets = await listSecrets(passphrase);
    if (secrets.length === 0) {
        info('No secrets saved yet');
    }
    else {
        console.log('');
        console.log('📋 Saved secrets:');
        console.log('══════════════════════════════════════════');
        for (const { key, description } of secrets) {
            const desc = description ? ` - ${description}` : '';
            console.log(`  ${key}${desc}`);
        }
        console.log('══════════════════════════════════════════');
        console.log(`  Total: ${secrets.length} secret(s)`);
    }
}
/**
 * Handle delete command
 */
async function handleDelete(key) {
    const sure = await confirm(`Delete secret "${key}"?`);
    if (!sure) {
        info('Cancelled.');
        process.exit(0);
    }
    const passphrase = await password('Passphrase: ');
    const result = await deleteSecret(key, passphrase);
    if (result.success) {
        success(result.message);
    }
    else {
        error(result.message);
    }
    process.exit(result.success ? 0 : 1);
}
/**
 * Handle status command
 */
async function handleStatus() {
    const status = await getVaultStatus();
    showStatusSummary(status);
}
/**
 * Handle reset command
 */
async function handleReset() {
    const sure = await confirm('This will delete ALL your secrets. This action cannot be undone. Continue?');
    if (!sure) {
        info('Cancelled.');
        return;
    }
    const reallySure = await confirm('Are you REALLY sure? Type "yes" to confirm: ');
    if (reallySure) {
        const result = await resetVault();
        if (result.success) {
            success('Vault has been reset. Run "vault init" to set up again.');
        }
        else {
            error(result.message);
        }
    }
    else {
        info('Cancelled.');
    }
}
/**
 * Handle interactive mode (no command)
 */
async function handleInteractive() {
    showWelcome();
    // Check if initialized
    const isInitialized = await checkInitialized();
    if (!isInitialized) {
        // First time setup
        info('First time setup detected.');
        console.log('');
        await handleInit();
        return;
    }
    // Show status and offer options
    const status = await getVaultStatus();
    showStatusSummary(status);
    console.log(`
What would you like to do?
  1. Add a new secret
  2. View a secret
  3. List all secrets
  4. Delete a secret
  5. Show status
  0. Exit
`);
    const choice = await question('Choose [1-5, 0]: ');
    switch (choice.trim()) {
        case '1': {
            const key = await question('Key name: ');
            await handleSet([key]);
            break;
        }
        case '2': {
            const key = await question('Key name: ');
            await handleGet(key);
            break;
        }
        case '3':
            await handleList();
            break;
        case '4': {
            const key = await question('Key to delete: ');
            await handleDelete(key);
            break;
        }
        case '5':
            await handleStatus();
            break;
        case '0':
            info('Goodbye!');
            break;
        default:
            info('Invalid choice.');
    }
}
/**
 * Main function
 */
async function main() {
    // Ensure Claude Code skill link exists (run on every command)
    ensureSkillLink();
    const args = process.argv.slice(2);
    // Show help
    if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
        if (skillLinkJustCreated) {
            console.log('');
            success('Claude Code 技能已安装');
            console.log('');
        }
        showHelp();
        process.exit(0);
    }
    const command = args[0];
    try {
        switch (command) {
            case 'init':
                await handleInit(args[1]); // Optional username parameter
                break;
            case 'get':
                if (!args[1]) {
                    error('Please provide a key name');
                    console.error('Usage: vault get <key>');
                    process.exit(1);
                }
                await handleGet(args[1]);
                break;
            case 'set':
                await handleSet(args.slice(1));
                break;
            case 'list':
                await handleList();
                break;
            case 'delete':
                if (!args[1]) {
                    error('Please provide a key name');
                    console.error('Usage: vault delete <key>');
                    process.exit(1);
                }
                await handleDelete(args[1]);
                break;
            case 'status':
                await handleStatus();
                break;
            case 'reset':
                await handleReset();
                break;
            default:
                // Maybe they typed "vault openai_key" instead of "vault get openai_key"?
                // Try to be helpful
                error(`Unknown command: ${command}`);
                console.error('');
                console.error('Did you mean:');
                console.error(`  vault get ${command}`);
                console.error('');
                console.error('Run "vault --help" for usage');
                process.exit(1);
        }
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        error(message);
        process.exit(1);
    }
}
// Run
main();
//# sourceMappingURL=index.js.map