# Vault — AI-Powered Secret Management for Claude Code

一个 Claude Code 技能，让 AI 帮你安全地管理 API 密钥、密码等敏感信息。

## 特点

- 🗣️ **对话式操作** — 用自然语言保存和获取密钥
- 🔐 **端到端加密** — AES-256-GCM 加密
- ☁️ **iCloud 同步** — 自动同步到所有设备（macOS）
- 🔑 **密码派生** — 相同密码在所有设备生成相同密钥
- ⚡ **零配置** — 安装后立即可用

**⚠️ 重要：保存密码、API Key 等敏感信息时，AI 会自动使用 Vault，不会保存到其他地方。**

---

## 安装

### 一键安装（推荐）

```bash
npm install -g @principle2026/vault
vault init
```

安装脚本会自动：
- 安装 CLI 命令
- 创建 Claude Code 技能链接
- 引导你完成首次设置

### 手动安装 Claude Code 技能

```bash
# 1. 安装 npm 包
npm install -g @principle2026/vault

# 2. 找到安装位置
npm root -g
# 输出: /usr/local/lib/node_modules （或其他路径）

# 3. 创建技能链接
ln -s $(npm root -g)/@principle2026/vault ~/.claude/skills/vault

# 4. 初始化
vault init
```

---

## 在 Claude Code 中使用

安装后，直接和 AI 对话。**首次使用时，AI 会询问你的 Vault 密码**，之后会自动使用。

### 保存密钥

```
你：记住我的 OpenAI 密钥是 sk-abc123
AI：你的 Vault 密码是什么？（我需要它来解锁 Vault）
你：mypassword
AI：✅ 已保存：openai_key
```

```
你：保存这个 GitHub token: ghp_xxx123
AI：[运行: VAULT_PASSPHRASE="mypassword" vault set github_token "ghp_xxx123" --description "GitHub Token"]
    ✅ Saved: github_token
```

### 获取密钥

```
你：用刚才保存的 token 创建一个 GitHub repo
AI：好的，使用你保存的 GitHub token...
    [运行: VAULT_PASSPHRASE="mypassword" vault get github_token]
    → 正在创建仓库...
```

```
你：我的 OpenAI 密钥是什么？
AI：[运行: VAULT_PASSPHRASE="mypassword" vault get openai_key]
    sk-abc123
```

### 查看所有密钥

```
你：我保存了哪些密钥？
AI：[运行: VAULT_PASSPHRASE="mypassword" vault list]
    📋 已保存的密钥：
    - openai_key - OpenAI API Key
    - github_token - GitHub Token
```

### AI 自动识别的关键词

**触发 Vault 保存：**
- "密码是...", "记住密码", "保存密码"
- "API key", "token", "密钥", "令牌"
- "sk-xxx", "ghp_xxx" (凭证格式)
- "保存到 vault"

| 你说 | AI 做 |
|------|------|
| "密码是 123456" | 用 Vault 保存 |
| "记住我的 OpenAI key" | 用 Vault 保存 |
| "我的密码是什么？" | 从 Vault 获取 |
| "有哪些密钥？" | 列出所有密钥 |
| "删除 xxx" | 删除密钥 |

---

## 多设备同步

**密钥数据通过 iCloud 自动同步**，每台设备只需：

```bash
# 1. 安装 Vault
npm install -g @principle2026/vault

# 2. 初始化（使用相同的密码）
vault init
```

| 内容 | 位置 | 同步方式 |
|------|------|---------|
| **加密密钥数据** | iCloud `.vault-data/` | ✅ 自动同步 |
| **技能链接** | `~/.claude/skills/vault` | ❌ 每台设备各自安装 |

**注意**：每台设备使用相同的密码即可访问同步的密钥。

---

## CLI 命令（手动使用）

```bash
# 查看状态
vault status

# 保存密钥
vault set <key>
# 或：echo "value" | vault set <key> -d "描述"

# 获取密钥
vault get <key>

# 列出所有密钥
vault list

# 删除密钥
vault delete <key>

# 重置（删除所有数据）
vault reset
```

### 环境变量

| 变量 | 说明 |
|------|------|
| `VAULT_PASSPHRASE` | Vault 密码（跳过交互式输入） |

```bash
# 非交互式使用（脚本/AI 调用）
VAULT_PASSPHRASE="yourpassword" vault set mykey "myvalue"
VAULT_PASSPHRASE="yourpassword" vault get mykey
```

---

## 安全设计

- **加密算法**: AES-256-GCM
- **密钥派生**: PBKDF2 (100,000 次迭代)
- **主密钥**: 从 Vault 密码派生（相同密码 = 相同密钥）
- **存储位置**: iCloud（macOS）或本地 `~/.vault-data/`
- **多设备同步**: 通过 iCloud 自动同步，所有设备使用相同密码即可访问

⚠️ **忘记密码无法恢复** — 密码是唯一能解密数据的途径

---

## 项目地址

- npm: https://www.npmjs.com/package/@principle2026/vault
- GitHub: https://github.com/xiaolin26/vault
