---
name: vault
description: |
  **CRITICAL**: When user wants to save passwords, API keys, tokens, or ANY sensitive credentials — ALWAYS use Vault skill. NEVER use corivo-save or other memory methods for sensitive data.

  **Triggers for Vault (HIGH PRIORITY):**
  - User says "密码是...", "记住密码", "保存密码", "password is..."
  - User says "API key", "token", "密钥", "令牌"
  - User says "sk-xxx", "ghp_xxx" (credential patterns)
  - User says "保存到 vault", "vault 保存"

  **What to do:**
  1. First time: Ask user "你的 Vault 密码是什么？"
  2. Use: VAULT_PASSPHRASE="<password>" vault set <key> "<value>"
  3. Confirm with: ✅ 已保存: <key>
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
  vault init

Then set a passphrase (at least 8 characters).
```

### 1. Save a secret (set_secret)

**IMPORTANT**: Always use `VAULT_PASSPHRASE` environment variable to avoid interactive prompts.

If the Vault passphrase is not known, ask the user first:

```
I need your Vault passphrase to save this secret.
```

Then use bash command:

```bash
VAULT_PASSPHRASE="<passphrase>" vault set <key-name> "<value>" --description "<description>"
```

Example:
```bash
VAULT_PASSPHRASE="mypassword" vault set openai_key "sk-abc123" --description "OpenAI API Key"
```

### 2. Get a secret (get_secret)

When the user wants to retrieve a secret, use bash command:

```bash
VAULT_PASSPHRASE="<passphrase>" vault get <key-name>
```

This will output the secret value.

### 3. List secrets (list_secrets)

```bash
VAULT_PASSPHRASE="<passphrase>" vault list
```

Shows all saved secret names (without values).

## Security Notes

- Passphrase must be at least 8 characters
- Secrets are encrypted using AES-256-GCM
- Master key is derived from passphrase (same password = same key on all devices)
- Encrypted data is stored in iCloud (if available) or locally
- Use VAULT_PASSPHRASE env var to avoid interactive prompts in AI mode
- ⚠️ Forgetting passphrase means data cannot be recovered

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `Vault is not initialized` | First time use | Run `vault init` |
| `Passphrase incorrect` | Wrong password | Re-enter correct passphrase |
| `Secret "xxx" not found` | Secret not found | Check name or use `vault list` |
| `Key name cannot be empty` | Validation failed | Provide valid key name |

## Storage Locations

- **iCloud (macOS)**: `~/Library/Mobile Documents/com~apple~CloudDocs/.vault-data/`
- **Local fallback**: `~/.vault-data/`

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
