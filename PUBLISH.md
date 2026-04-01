# 发布到 npm

## 前置准备

### 1. 注册 npm 账号
访问 https://www.npmjs.com/signup 注册

### 2. 登录
```bash
npm login
```

### 3. 检查包名是否可用
```bash
npm search @xiaolin26/vault
```

---

## 发布步骤

### 1. 更新版本号
```bash
npm version patch  # 1.0.0 → 1.0.1 (bug 修复)
npm version minor  # 1.0.0 → 1.1.0 (新功能)
npm version major  # 1.0.0 → 2.0.0 (破坏性更新)
```

### 2. 编译
```bash
npm run build
```

### 3. 发布
```bash
npm publish --access public
```

---

## 用户安装方式

### 全局安装（推荐）
```bash
npm install -g @xiaolin26/vault
vault init <username>
```

### 本地项目使用
```bash
npm install @xiaolin26/vault
```

### Claude Code 技能安装
```bash
# 安装后创建符号链接
ln -s $(npm root -g)/@xiaolin26/vault ~/.claude/skills/vault
```

---

## 更新已发布的版本

```bash
# 1. 修改代码
# 2. 更新版本
npm version patch

# 3. 发布
npm publish --access public
```

---

## 撤回发布（紧急情况）

```bash
# 24小时内可以撤回
npm unpublish @xiaolin26/vault@1.0.0 --force

# 或弃用某个版本
npm deprecate @xiaolin26/vault@1.0.0 "此版本有安全问题，请升级到 1.0.1"
```

---

## 发布检查清单

- [ ] 代码已编译 (`npm run build`)
- [ ] 版本号已更新 (`npm version ...`)
- [ ] package.json 信息完整
- [ ] README.md 有清晰的使用说明
- [ ] 已登录 npm (`npm whoami`)
- [ ] 测试通过 (`npm test`)
