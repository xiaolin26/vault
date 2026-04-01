# 🔐 Vault

**[English](#english) | [中文](#中文)**

---

<a id="english"></a>

# Vault — AI-Native Secret Management for Claude Code

> **Coding with AI but still copy-pasting API keys by hand?**
>
> Vault lets you manage all your secrets with natural language. Just say "remember my OpenAI key" — that's it.

---

## The Problem

If you use Claude Code, you've hit these walls:

- 🔑 Need an API key mid-deploy — scramble through notes to find it
- 🤦 Accidentally commit a secret to git — panic mode
- 💻 Switch to a new Mac — reconfigure every single key from scratch
- 📋 `.env` files scattered across dozens of projects — unmanageable

**Vault turns AI into your secret keeper — encrypted, synced, zero friction.**

---

## Why Vault

| | Vault | .env files | 1Password CLI | System Keychain |
|---|---|---|---|---|
| AI-native conversational UI | ✅ | ❌ | ❌ | ❌ |
| End-to-end encryption (AES-256-GCM) | ✅ | ❌ | ✅ | ✅ |
| iCloud auto-sync | ✅ | ❌ | Paid | ❌ |
| Deep Claude Code integration | ✅ | ❌ | ❌ | ❌ |
| Fully open-source | ✅ | — | ❌ | ❌ |
| Zero-config setup | ✅ | ✅ | ❌ | ❌ |

---

## Get Started in 30 Seconds

```bash
npm install -g @principle2026/vault
vault init
```

The installer handles everything: CLI setup → Claude Code skill linking → first-time passphrase.

**Then just talk to Claude Code:**

```
You: Remember my OpenAI key is sk-abc123
AI:  ✅ Securely saved: openai_key

You: Create a GitHub repo using my saved token
AI:  Reading your saved token... → Repo created ✅

You: What secrets do I have?
AI:  📋 openai_key · github_token · aws_secret
```

**No config files. No CLI flags. Just plain English.**

---

## Key Features

### 🗣️ Conversational — Talk, Don't Type Commands

No commands to memorize. AI automatically detects sensitive info and routes it through Vault:

- `"My password is 123456"` → auto-saved
- `"Remember my sk-xxx"` → recognized as API key, saved
- `"Deploy with my AWS credentials"` → auto-retrieved and used

### 🔐 Military-Grade Encryption — Your Keys, Only Yours

- **AES-256-GCM** encryption (the same standard used for classified government communications)
- **PBKDF2** key derivation with 100,000 iterations — brute force is not an option
- Passphrase never touches disk, never uploaded, never shared. **Forget it = data gone forever** (that's a feature, not a bug)

### ☁️ iCloud Sync — Switch Devices Seamlessly

Encrypted data syncs automatically via iCloud. On a new device:

```bash
npm install -g @principle2026/vault
vault init    # Same passphrase → all secrets instantly available
```

| What | Where | Sync |
|---|---|---|
| Encrypted secret data | iCloud `~/.vault-data/` | ✅ Automatic |
| CLI + skill link | Local `~/.claude/skills/vault` | Install per device |

### 🔓 Fully Open-Source — Trust Code, Not Promises

Every line of encryption logic is auditable. Don't take our word for it: [view the source →](https://github.com/xiaolin26/vault/tree/main/src)

---

## How AI Decides When to Use Vault

Vault runs as a Claude Code Skill. AI automatically determines when to invoke it based on context:

| What you say | What AI does |
|---|---|
| "My password is...", "key is...", "token is..." | 🔒 Encrypt & save via Vault |
| "Use my xxx key", "the token I saved earlier" | 🔓 Retrieve from Vault & use |
| "What secrets do I have?", "List my keys" | 📋 List all saved entries |
| "Delete xxx" | 🗑️ Remove from Vault |

**⚠️ Critical design: When AI detects passwords / API keys / sensitive data, it automatically routes through Vault — never saved to CLAUDE.md or any plaintext file.**

---

## CLI Reference

Beyond conversational use, you can also operate directly from the terminal:

```bash
vault status               # Check Vault status
vault set <key>            # Interactively save a secret
vault get <key>            # Retrieve a secret
vault list                 # List all secrets
vault delete <key>         # Delete a secret
vault reset                # Reset (delete all data)
```

For scripts / CI:

```bash
VAULT_PASSPHRASE="yourpassword" vault set mykey "myvalue"
VAULT_PASSPHRASE="yourpassword" vault get mykey
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────┐
│              Your Passphrase                    │
│           (exists only in your head)            │
└────────────────────┬────────────────────────────┘
                     │ PBKDF2 (100K iterations)
                     ▼
              ┌─────────────┐
              │  Master Key  │  ← Same passphrase = same key
              └──────┬──────┘     (multi-device support)
                     │ AES-256-GCM
                     ▼
         ┌───────────────────────┐
         │   Encrypted Secrets   │
         │   ~/.vault-data/      │
         └───────────┬───────────┘
                     │ iCloud Sync
                     ▼
            ┌─────────────────┐
            │  All Your Macs  │
            │  Instant Access  │
            └─────────────────┘
```

**Design principles:**
- Passphrase is never stored or transmitted — key is derived in real-time from your input
- Even if iCloud is compromised, data is unreadable without the passphrase
- Even if code is tampered with, the encryption algorithm itself guarantees security (AES-256-GCM is industry standard)

---

## Manual Installation (Optional)

For more granular control over the installation process:

```bash
# 1. Install the npm package
npm install -g @principle2026/vault

# 2. Create Claude Code skill link
ln -s $(npm root -g)/@principle2026/vault ~/.claude/skills/vault

# 3. Initialize
vault init
```

---

## FAQ

**Q: What if I forget my passphrase?**
A: Unrecoverable. By design — no backdoor means nobody can bypass encryption, including the developer.

**Q: Does it work on Windows / Linux?**
A: CLI and encryption work on all platforms. iCloud sync is macOS only; other platforms store data locally at `~/.vault-data/`.

**Q: How is this different from `.env` files?**
A: `.env` files are plaintext and easily committed to git by mistake. Vault encrypts everything, and AI manages it automatically — no files to maintain.

**Q: Is the passphrase safe? Can AI see it?**
A: The passphrase is passed to the CLI via environment variable. It's never written to any file or log. AI uses it transiently and does not persist it in conversation history.

---

## Links

- 📦 npm: [@principle2026/vault](https://www.npmjs.com/package/@principle2026/vault)
- 💻 GitHub: [xiaolin26/vault](https://github.com/xiaolin26/vault)

---

## License

MIT — Use freely, modify freely, distribute freely.

---

<p align="center">
  <b>In the age of AI-powered coding, secret management should be AI-powered too.</b><br>
  <sub>Built with ❤️ for the Claude Code community</sub>
</p>

---
---

<a id="中文"></a>

# Vault — AI 时代的密码管理，专为 Claude Code 而生

**[English](#english) | [中文](#中文)**

> **用 AI 编程，却还在手动复制粘贴 API Key？**
>
> Vault 让你用自然语言管理所有密钥。说一句"记住我的 OpenAI 密钥"，就够了。

---

## 痛点

用 Claude Code 开发时，你一定遇到过这些场景：

- 🔑 部署项目需要 API Key，翻遍笔记才找到
- 🤦 密钥写进代码被 git 提交，慌得一批
- 💻 换了台电脑，所有密钥都要重新配置
- 📋 `.env` 文件散落在几十个项目里，根本管不过来

**Vault 解决的核心问题：让 AI 成为你的密钥管家，安全、同步、零摩擦。**

---

## 为什么选 Vault

| | Vault | .env 文件 | 1Password CLI | 系统 Keychain |
|---|---|---|---|---|
| AI 原生对话式操作 | ✅ | ❌ | ❌ | ❌ |
| 端到端加密 (AES-256-GCM) | ✅ | ❌ | ✅ | ✅ |
| iCloud 自动同步 | ✅ | ❌ | 需订阅 | ❌ |
| Claude Code 深度集成 | ✅ | ❌ | ❌ | ❌ |
| 完全开源 | ✅ | — | ❌ | ❌ |
| 零配置上手 | ✅ | ✅ | ❌ | ❌ |

---

## 30 秒上手

```bash
npm install -g @principle2026/vault
vault init
```

安装脚本自动完成：CLI 安装 → Claude Code 技能链接 → 首次密码设置。

**然后，直接跟 Claude Code 说话就行：**

```
你：记住我的 OpenAI 密钥是 sk-abc123
AI：✅ 已安全保存：openai_key

你：用我的 GitHub token 创建一个 repo
AI：好的，正在读取你保存的 token...→ 仓库已创建 ✅

你：我保存了哪些密钥？
AI：📋 openai_key · github_token · aws_secret
```

**就这么简单。没有配置文件，没有命令行参数，说人话就行。**

---

## 核心特性

### 🗣️ 对话式操作 — 说人话，存密码

不需要记命令。AI 自动识别你话里的敏感信息，主动使用 Vault 保存：

- `"密码是 123456"` → 自动保存
- `"记住我的 sk-xxx"` → 自动识别为 API Key 并保存
- `"帮我部署，用之前的 AWS 密钥"` → 自动读取并使用

### 🔐 军事级加密 — 你的密钥只有你能解

- **AES-256-GCM** 加密（同级别用于政府机密通信）
- **PBKDF2** 密钥派生，100,000 次迭代，暴力破解？想都别想
- 密码不落盘，不上传，不共享。**忘记密码 = 数据不可恢复**（这是 feature，不是 bug）

### ☁️ iCloud 同步 — 换电脑无感衔接

加密后的数据通过 iCloud 自动同步。新设备只需：

```bash
npm install -g @principle2026/vault
vault init    # 输入相同密码，所有密钥立即可用
```

| 内容 | 存储位置 | 同步 |
|---|---|---|
| 加密密钥数据 | iCloud `~/.vault-data/` | ✅ 自动 |
| CLI + 技能链接 | 本地 `~/.claude/skills/vault` | 每台设备各自安装 |

### 🔓 完全开源 — 信任不靠承诺，靠代码

每一行加密逻辑都可审计。不信？自己看：[源代码 →](https://github.com/xiaolin26/vault/tree/main/src)

---

## AI 自动识别规则

Vault 作为 Claude Code 的技能（Skill）运行，AI 会根据上下文自动判断何时使用：

| 你说的话 | AI 的行为 |
|---|---|
| "密码是..."、"key 是..."、"token 是..." | 🔒 用 Vault 加密保存 |
| "用我的 xxx 密钥"、"之前保存的 token" | 🔓 从 Vault 读取并使用 |
| "有哪些密钥？"、"列出我的密码" | 📋 列出所有已保存项 |
| "删除 xxx" | 🗑️ 从 Vault 移除 |

**⚠️ 关键设计：当 AI 检测到密码 / API Key 等敏感信息时，会自动走 Vault 通道，绝不会保存到 CLAUDE.md 或其他明文文件。**

---

## CLI 命令参考

除了对话式使用，你也可以直接在终端操作：

```bash
vault status               # 查看 Vault 状态
vault set <key>            # 交互式保存密钥
vault get <key>            # 获取密钥
vault list                 # 列出所有密钥
vault delete <key>         # 删除密钥
vault reset                # 重置（删除所有数据）
```

脚本 / CI 中使用：

```bash
VAULT_PASSPHRASE="yourpassword" vault set mykey "myvalue"
VAULT_PASSPHRASE="yourpassword" vault get mykey
```

---

## 安全架构

```
┌─────────────────────────────────────────────────┐
│                  你的密码                         │
│              （只存在你脑中）                      │
└────────────────────┬────────────────────────────┘
                     │ PBKDF2 (100K iterations)
                     ▼
              ┌─────────────┐
              │   主密钥     │  ← 相同密码 = 相同密钥
              └──────┬──────┘     (支持多设备)
                     │ AES-256-GCM
                     ▼
         ┌───────────────────────┐
         │   加密后的密钥数据     │
         │   ~/.vault-data/      │
         └───────────┬───────────┘
                     │ iCloud 同步
                     ▼
            ┌─────────────────┐
            │  所有 Mac 设备   │
            │  即时同步可用    │
            └─────────────────┘
```

**设计原则：**
- 密码不存储、不传输 — 每次使用时从你的输入实时派生密钥
- 即使 iCloud 被入侵，没有密码也无法解密
- 即使代码被恶意修改，加密算法本身保证安全（AES-256-GCM 是行业标准）

---

## 手动安装（可选）

如果你想更精细地控制安装过程：

```bash
# 1. 安装 npm 包
npm install -g @principle2026/vault

# 2. 创建 Claude Code 技能链接
ln -s $(npm root -g)/@principle2026/vault ~/.claude/skills/vault

# 3. 初始化
vault init
```

---

## 常见问题

**Q: 忘记密码怎么办？**
A: 无法恢复。这是刻意的安全设计 — 没有后门意味着没有人能绕过加密，包括开发者。

**Q: 支持 Windows / Linux 吗？**
A: CLI 和加密功能全平台可用。iCloud 同步仅限 macOS，其他平台数据存储在本地 `~/.vault-data/`。

**Q: 和 `.env` 文件有什么区别？**
A: `.env` 是明文存储，容易被误提交到 git。Vault 全程加密，且 AI 会自动管理，你不需要手动维护任何文件。

**Q: 密码安全吗？会被 AI 看到吗？**
A: 密码通过环境变量传递给 CLI，不会被写入任何文件或日志。AI 用完即丢，不会记录到对话历史中。

---

## 链接

- 📦 npm: [@principle2026/vault](https://www.npmjs.com/package/@principle2026/vault)
- 💻 GitHub: [xiaolin26/vault](https://github.com/xiaolin26/vault)

---

## License

MIT — 自由使用，自由修改，自由分发。

---

<p align="center">
  <b>用 AI 写代码的时代，密码管理也该 AI 化了。</b><br>
  <sub>Built with ❤️ for the Claude Code community</sub>
</p>
