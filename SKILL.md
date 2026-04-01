---
name: vault
description: |
  AI-powered secret management. Automatically save and retrieve API keys, passwords, and other sensitive information.

  When users say "remember", "save", or "store", AI will automatically save secrets.
  When users say "my key", "that password", AI will automatically retrieve secrets.

  After initialization, AI will securely manage your sensitive information in the background.
---

# Vault — AI Secret Management

Vault is a Claude Code skill that enables AI to automatically manage your secrets and sensitive information.

## When to Use

Consider secret operations when users say:

**Save secrets:**
- "Remember my OpenAI key is sk-xxx"
- "Save this password"
- "AWS secret key is xxxxx, store it"

**Retrieve secrets:**
- "Use that key to call the API"
- "What's my password"
- "Read the saved AWS key"

**List secrets:**
- "What secrets have I saved"
- "List all secrets"

## Steps

### 0. Check if Vault is initialized

```bash
vault status
```

If it shows `Initialized: no`, prompt the user:

```
Vault is not initialized. Please run:
  vault init <username>

Then set a passphrase (at least 8 characters).
```

### 1. Save a secret (set_secret)

When the user wants to save a secret, use bash command:

```bash
echo "<secret-value>" | vault set <key-name> --description "<description>"
```

Example:
```bash
echo "sk-abc123" | vault set openai_key --description "OpenAI API Key"
```

**Important**: Never pass secret values directly in command history. Use echo pipe.

### 2. Get a secret (get_secret)

When the user wants to retrieve a secret, use bash command:

```bash
vault get <key-name>
```

This will prompt for passphrase, then output the secret value.

### 3. List secrets (list_secrets)

```bash
vault list
```

Shows all saved secret names (without values).

## Security Notes

- Passphrase must be at least 8 characters
- Secrets are encrypted using AES-256-GCM
- Encrypted data is stored in iCloud (if available) or locally
- Master key is stored in system keychain

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `Vault is not initialized` | First time use | Run `vault init <username>` |
| `Passphrase incorrect` | Wrong password | Re-enter correct passphrase |
| `Secret "xxx" not found` | Secret not found | Check name or use `vault list` |
| `Key name cannot be empty` | Validation failed | Provide valid key name |

## Storage Locations

- **iCloud**: `~/Library/Mobile Documents/com~apple~CloudDocs/.vault-data/`
- **Local fallback**: `~/.vault-data/`
- **Keychain**: service=`vault-skill`, account=`master-key`

## Example Conversations

```
User: Remember my OpenAI key is sk-abc123
AI: I'll save this secret...
    [run: echo "sk-abc123" | vault set openai_key --description "OpenAI API Key"]
    Saved: openai_key

User: Use that key to call the OpenAI API
AI: [run: vault get openai_key]
    Using sk-abc123 to call the API...
```
