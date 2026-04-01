#!/usr/bin/env bun
/**
 * Post-install script
 * Automatically creates Claude Code skill link after npm install
 */

import { existsSync, mkdirSync } from 'fs'
import { symlinkSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Colors for terminal output
const GREEN = '\x1b[0;32m'
const BLUE = '\x1b[0;34m'
const YELLOW = '\x1b[1;33m'
const NC = '\x1b[0m'

function log(msg: string, color = GREEN) {
  console.log(`${color}${msg}${NC}`)
}

async function main() {
  // Only run for global installation
  const isGlobal = process.env.npm_config_global === 'true'
  if (!isGlobal) {
    return
  }

  // Get the package directory (dist folder)
  // We're in dist/postinstall.js, so go up one level
  const packageDir = dirname(__dirname)

  // Claude Code skills directory
  const skillsDir = join(process.env.HOME || '', '.claude', 'skills')
  const linkPath = join(skillsDir, 'vault')

  try {
    // Create skills directory if it doesn't exist
    if (!existsSync(skillsDir)) {
      mkdirSync(skillsDir, { recursive: true })
    }

    // Check if link already exists
    if (existsSync(linkPath)) {
      // Remove old link
      const { rmSync } = await import('fs')
      try {
        rmSync(linkPath, { recursive: true, force: true })
      } catch {
        // Ignore error
      }
    }

    // Create symbolic link
    symlinkSync(packageDir, linkPath)

    log('')
    log('🔐 Vault - AI Secret Management', BLUE)
    log('━'.repeat(40))
    log('')
    log('✓ Claude Code 技能已安装', GREEN)
    log('')
    log('下一步：')
    log('  1. 初始化: ' + YELLOW + 'vault init' + NC)
    log('  2. 然后在 Claude Code 中说：')
    log('     「记住我的密钥是 xxx」')
    log('')

  } catch (error) {
    // Silently fail - don't break installation
    // User can manually create link if needed
  }
}

main().catch(() => {})
