# Vault - 项目记忆

## 项目概述
Vault 是一个 AI 驱动的密钥管理工具，为 Claude Code 设计。

## 技术架构
- **语言**: TypeScript/Node.js
- **加密**: AES-256-GCM
- **密钥派生**: PBKDF2 (100,000 迭代)
- **存储**: iCloud (macOS) 或本地文件
- **包名**: `@principle2026/vault`
- **仓库**: https://github.com/xiaolin26/vault

## 重要修复 (2026-04-02)

### 密码验证漏洞修复
**问题**: 原代码中 `deriveMasterKey` 只派生密钥，不验证密码正确性，任何密码都能解密数据。

**解决方案**: 添加 `_vault_verify` 字段，存储加密的已知值 "VALID"，在访问 Vault 时先验证密码。

**关键代码** (src/tools.ts):
```typescript
const VAULT_VERIFY_KEY = '_vault_verify'
const VERIFICATION_VALUE = 'VALID'

async function verifyPassphrase(store: StoredData, passphrase: string): Promise<void> {
  const verifyEntry = store.secrets[VAULT_VERIFY_KEY]
  if (!verifyEntry) {
    throw new Error('Vault format outdated. Please run vault init to migrate.')
  }
  const parsed = JSON.parse(verifyEntry.value)
  const decrypted = await decrypt(parsed.encrypted, parsed.salt, passphrase)
  if (decrypted !== VERIFICATION_VALUE) {
    throw new VaultError('INVALID_PASSPHRASE', 'Incorrect passphrase')
  }
}
```

## npm 发布配置

### 正确的 Token
**发布 Token**: 存储在 Vault 中，key 为 `vault-cicd`
- 位置: GitHub Actions secret `NPM_TOKEN`
- 权限: 发布 + 绕过 2FA

### CI/CD 工作流
- **触发条件**: 推送 `v*.*.*` 格式的 tag
- **文件**: `.github/workflows/release.yml`
- **工作流程**: build → publish

### 发布新版本步骤
1. 更新 `package.json` 中的版本号
2. `git commit` + `git push`
3. `git tag vx.x.x` + `git push origin vx.x.x`
4. GitHub Actions 自动发布

## Vault 数据格式
```json
{
  "version": "2.0",
  "user_id": "xiaolin",
  "secrets": {
    "_vault_salt": { "value": "{\"salt\":\"...\"}", ... },
    "_vault_verify": { "value": "{\"encrypted\":{...},\"salt\":\"...\"}", ... }
  }
}
```

## 相关文件
- `src/tools.ts` - 核心 API (initVault, getSecret, setSecret, listSecrets, deleteSecret)
- `src/Crypto.ts` - 加密/解密函数
- `src/Store.ts` - 数据存储 (iCloud/本地)
- `src/CLI.ts` - 命令行界面

## 版本历史
- **1.2.1** (2026-04-02) - CI/CD 修复验证版本
- **1.2.0** (2026-04-02) - 密码验证漏洞修复
- **1.1.8** 及更早 - 初始版本
