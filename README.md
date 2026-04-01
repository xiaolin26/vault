# Vault — AI-Powered Secret Management

A Claude Code plugin that enables AI to automatically manage your secrets and sensitive information.

## Features

- 🗣️ **Conversational** — Save and retrieve secrets using natural language
- 🔐 **End-to-end encryption** — AES-256-GCM encryption
- ☁️ **iCloud sync** — Automatically sync across all your devices
- 🔑 **Keychain integration** — Secure master key storage
- ⚡ **Zero config** — Ready to use after initialization

## Installation

### 方式 1: npm 全局安装（推荐）

```bash
npm install -g @principle2026/vault
vault init
```

### 方式 2: 本地开发

```bash
git clone <repository>
cd Vault
npm install
npm run build
```

## Usage

### Initialize

```bash
vault init
```

Follow the interactive prompts to set up your master passphrase.

### Save a secret

```bash
echo "sk-abc123" | vault set openai_key --description "OpenAI API Key"
```

### Get a secret

```bash
vault get openai_key
```

### List secrets

```bash
vault list
```

### Delete a secret

```bash
vault delete openai_key
```

### Check status

```bash
vault status
```

## AI Conversation Usage

In Claude Code, use natural language:

```
You: Remember my OpenAI key is sk-abc123
AI: [auto-save] Saved: openai_key

You: Use that key to call the API
AI: [auto-retrieve] Using sk-abc123...
```

## Security Design

- **Algorithm**: AES-256-GCM
- **Key derivation**: PBKDF2 (100,000 iterations)
- **Storage**: iCloud or local `~/.vault-data/`
- **Master key**: System keychain (unlocked by passphrase)

## Project Structure

```
src/
├── Crypto.ts   # Encryption/decryption
├── Keychain.ts # Keychain operations
├── Store.ts    # Data storage
├── tools.ts    # Core functions
└── index.ts    # CLI entry point
```

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Run CLI
./dist/index.js status
```

## Dependencies

- `keytar` — Keychain access
- Web Crypto API — Encryption operations
