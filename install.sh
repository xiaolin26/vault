#!/bin/bash
# Vault 一键安装脚本
# 同时安装 CLI 和 Claude Code 技能

set -e

echo "🔐 Vault - AI 密钥管理"
echo "=============================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}错误: 未安装 npm${NC}"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓${NC} npm 已安装"

# 检查 Claude Code 目录
CLAUDE_DIR="$HOME/.claude"
SKILLS_DIR="$CLAUDE_DIR/skills"
mkdir -p "$SKILLS_DIR"

# 1. 安装 npm 包（全局）
echo ""
echo "📦 安装 Vault CLI..."
npm install -g @principle2026/vault

# 2. 获取 npm 全局模块路径
NPM_ROOT=$(npm root -g)
PACKAGE_PATH="$NPM_ROOT/@principle2026/vault"

# 3. 创建 Claude Code 技能链接
LINK_PATH="$SKILLS_DIR/vault"

# 删除旧的链接/目录
if [ -L "$LINK_PATH" ]; then
    echo -e "${YELLOW}⚠${NC} 发现已存在的符号链接，将重新创建..."
    rm "$LINK_PATH"
elif [ -d "$LINK_PATH" ]; then
    echo -e "${YELLOW}⚠${NC} $LINK_PATH 已存在"
    read -p "是否删除并重新创建？(y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$LINK_PATH"
    else
        echo "跳过技能链接创建"
        LINK_PATH=""
    fi
fi

if [ -n "$LINK_PATH" ]; then
    ln -s "$PACKAGE_PATH" "$LINK_PATH"
    echo -e "${GREEN}✓${NC} Claude Code 技能已链接: ~/.claude/skills/vault"
fi

# 4. 验证安装
echo ""
echo "🔍 验证安装..."

if command -v vault &> /dev/null; then
    echo -e "${GREEN}✓${NC} vault 命令可用"
else
    echo -e "${RED}✗${NC} vault 命令不可用，请检查 PATH"
fi

if [ -L "$LINK_PATH" ]; then
    echo -e "${GREEN}✓${NC} Claude Code 技能已安装"
fi

# 5. 检查是否已初始化
echo ""
VAULT_STATUS=$(vault status 2>/dev/null || echo "未初始化")
if echo "$VAULT_STATUS" | grep -q "Initialized: No"; then
    echo -e "${BLUE}ℹ️${NC} Vault 尚未初始化"
    echo ""
    echo "下一步："
    echo "  ${YELLOW}vault init${NC}"
    echo ""
    echo "然后就可以在 Claude Code 中使用了！"
elif echo "$VAULT_STATUS" | grep -q "Initialized: Yes"; then
    echo -e "${GREEN}✓${NC} Vault 已初始化，可以开始使用！"
else
    echo -e "${BLUE}ℹ️${NC} 运行 ${YELLOW}vault init${NC} 完成设置"
fi

echo ""
echo -e "${GREEN}==============================${NC}"
echo -e "${GREEN}✅ 安装完成！${NC}"
echo ""
echo "使用方式："
echo "  CLI:      ${YELLOW}vault --help${NC}"
echo "  Claude Code:  直接对话说「记住我的密钥是 xxx」"
echo ""
