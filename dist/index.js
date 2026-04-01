#!/usr/bin/env bun
/**
 * Vault CLI - Command line entry point
 *
 * Usage: vault <command> [args]
 */
import { deleteSecret, getSecret, getVaultStatus, initVault, listSecrets, resetVault, setSecret, } from './tools.js';
/**
 * Read a line from stdin
 */
function readLine() {
    // Use readline module
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question('', (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}
/**
 * Read passphrase (hidden input)
 */
async function readPassphraseHidden() {
    // Simplified: direct read (should hide in production)
    process.stderr.write('Passphrase: ');
    const passphrase = await readLine();
    if (!passphrase || passphrase.length < 8) {
        throw new Error('Passphrase must be at least 8 characters');
    }
    return passphrase;
}
/**
 * Show help
 */
function showHelp() {
    console.log(`
Vault - AI-Powered Secret Management

Usage: vault <command> [args]

Commands:
  init <username>      Initialize Vault
  get <key>            Get a secret
  set <key> [value]    Set a secret (reads from stdin if no value)
  list                 List all secrets
  delete <key>         Delete a secret
  status               Check Vault status
  reset                Reset Vault

Options:
  -d, --description    Secret description (for set command)

Examples:
  vault init xiaolin
  vault set openai_key sk-abc123 -d "OpenAI API Key"
  vault get openai_key
  vault list
`);
}
/**
 * Main function
 */
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
        showHelp();
        process.exit(0);
    }
    const command = args[0];
    try {
        switch (command) {
            case 'init': {
                const username = args[1];
                if (!username) {
                    console.error('Error: Please provide a username');
                    console.error('Usage: vault init <username>');
                    process.exit(1);
                }
                console.log('Set a new passphrase (at least 8 characters)');
                const passphrase1 = await readPassphraseHidden();
                const passphrase2 = await readPassphraseHidden();
                if (passphrase1 !== passphrase2) {
                    console.error('Error: Passphrases do not match');
                    process.exit(1);
                }
                const result = await initVault(username, passphrase1);
                console.log(result.message);
                process.exit(result.success ? 0 : 1);
            }
            case 'get': {
                const key = args[1];
                if (!key) {
                    console.error('Error: Please provide a key name');
                    console.error('Usage: vault get <key>');
                    process.exit(1);
                }
                const passphrase = await readPassphraseHidden();
                const value = await getSecret(key, passphrase);
                console.log(value);
                break;
            }
            case 'set': {
                const key = args[1];
                if (!key) {
                    console.error('Error: Please provide a key name');
                    console.error('Usage: vault set <key> [value]');
                    process.exit(1);
                }
                // Parse options
                let value = args[2];
                let description = '';
                for (let i = 2; i < args.length; i++) {
                    if (args[i] === '-d' || args[i] === '--description') {
                        description = args[i + 1] || '';
                        i++;
                    }
                }
                // If no value provided, read from stdin
                if (!value) {
                    console.error('Secret value:');
                    value = await readLine();
                }
                const passphrase = await readPassphraseHidden();
                const result = await setSecret(key, value, passphrase, description);
                console.log(result.message);
                process.exit(result.success ? 0 : 1);
            }
            case 'list': {
                const passphrase = await readPassphraseHidden();
                const secrets = await listSecrets(passphrase);
                if (secrets.length === 0) {
                    console.log('No secrets saved yet');
                }
                else {
                    console.log('Saved secrets:');
                    for (const { key, description } of secrets) {
                        const desc = description ? ` - ${description}` : '';
                        console.log(`  ${key}${desc}`);
                    }
                }
                break;
            }
            case 'delete': {
                const key = args[1];
                if (!key) {
                    console.error('Error: Please provide a key name');
                    console.error('Usage: vault delete <key>');
                    process.exit(1);
                }
                const passphrase = await readPassphraseHidden();
                const result = await deleteSecret(key, passphrase);
                console.log(result.message);
                process.exit(result.success ? 0 : 1);
            }
            case 'status': {
                const status = await getVaultStatus();
                console.log('Vault Status:');
                console.log(`  Initialized: ${status.initialized ? 'Yes' : 'No'}`);
                console.log(`  Storage type: ${status.storageType}`);
                if (status.userId) {
                    console.log(`  User: ${status.userId}`);
                }
                console.log(`  Secret count: ${status.secretCount}`);
                break;
            }
            case 'reset': {
                const result = await resetVault();
                console.log(result.message);
                process.exit(result.success ? 0 : 1);
            }
            default:
                console.error(`Unknown command: ${command}`);
                console.error('Run "vault --help" for usage');
                process.exit(1);
        }
    }
    catch (error) {
        console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=index.js.map