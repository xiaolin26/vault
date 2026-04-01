#!/usr/bin/env bun
/**
 * Post-install script
 * Runs after npm install to guide user through setup
 */
import { showWelcome, info, success } from './CLI.js';
import { getVaultStatus } from './tools.js';
async function main() {
    // Only run for global installation
    const isGlobal = process.env.npm_config_global === 'true';
    if (!isGlobal) {
        return;
    }
    // Check if already initialized
    const status = await getVaultStatus();
    showWelcome();
    if (status.initialized) {
        success('Vault 已就绪！');
        console.log('');
        info('在 Claude Code 中说「记住我的密钥是 xxx」来保存密钥');
        return;
    }
    // Not initialized
    console.log('');
    console.log('🚀 下一步：');
    console.log('');
    console.log('  1. 初始化 Vault:');
    console.log('     ${YELLOW}vault init${NC}');
    console.log('');
    console.log('  2. 然后在 Claude Code 中使用:');
    console.log('     「记住我的 OpenAI 密钥是 sk-xxx」');
    console.log('');
}
main().catch(() => {
    // Silently fail - don't break installation
});
//# sourceMappingURL=postinstall.js.map