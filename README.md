# 🔐 Vault — AI 时代的密码管理，专为 Claude Code 而生

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
