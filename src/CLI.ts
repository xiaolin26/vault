/**
 * CLI - Interactive command line interface
 *
 * Handles user input, password prompts, and interactive flows
 */

import { createInterface } from 'readline'
import { getVaultStatus } from './tools.js'

/**
 * Create readline interface
 */
function createRL() {
  return createInterface({
    input: process.stdin,
    output: process.stdout,
  })
}

/**
 * Ask a question and get answer
 */
export function question(prompt: string): Promise<string> {
  const rl = createRL()
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

/**
 * Ask for password with hidden input
 */
export async function password(prompt = 'Passphrase: '): Promise<string> {
  const rl = createRL()

  // Hide output
  const stdin = process.stdin
  const stdout = process.stdout

  // Mute output
  ;(stdin as any).setRawMode(true)
  stdin.resume()
  stdin.setEncoding('utf8')

  stdout.write(prompt)

  return new Promise((resolve) => {
    let password = ''

    const onData = (char: string) => {
      const charCode = char.charCodeAt(0)

      // Enter = 13, Ctrl+D = 4
      if (charCode === 13 || charCode === 4) {
        stdin.pause()
        stdin.removeListener('data', onData)
        ;(stdin as any).setRawMode(false)
        stdout.write('\n')
        rl.close()
        resolve(password)
        return
      }

      // Backspace = 127, Ctrl+H = 8
      if (charCode === 127 || charCode === 8) {
        if (password.length > 0) {
          password = password.slice(0, -1)
        }
        return
      }

      // Ctrl+C = 3
      if (charCode === 3) {
        stdin.pause()
        stdin.removeListener('data', onData)
        ;(stdin as any).setRawMode(false)
        stdout.write('^C\n')
        rl.close()
        process.exit(1)
        return
      }

      // Regular character
      password += char
    }

    stdin.on('data', onData)
  })
}

/**
 * Show welcome banner
 */
export function showWelcome() {
  console.log(`
🔐 Vault - AI-Powered Secret Management
══════════════════════════════════════════
`)
}

/**
 * Show first-time setup welcome
 */
export function showSetupWelcome() {
  console.log(`
👋 Welcome to Vault!

This is your first time using Vault. Let's get you set up.

Vault will store your secrets securely using AES-256 encryption.
Your data is stored locally (or synced via iCloud on macOS).

You'll need to set a master passphrase to protect your secrets.
`)
}

/**
 * Confirm action
 */
export async function confirm(prompt: string): Promise<boolean> {
  const answer = await question(`${prompt} (y/N): `)
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes'
}

/**
 * Show success message
 */
export function success(message: string) {
  console.log(`✅ ${message}`)
}

/**
 * Show error message
 */
export function error(message: string) {
  console.error(`❌ ${message}`)
}

/**
 * Show info message
 */
export function info(message: string) {
  console.log(`ℹ️  ${message}`)
}

/**
 * Check if initialized, show welcome if first time
 */
export async function checkInitialized(): Promise<boolean> {
  const status = await getVaultStatus()

  if (!status.initialized) {
    return false
  }

  return true
}

/**
 * Run interactive setup
 */
export async function runSetup(): Promise<{
  username: string
  passphrase: string
}> {
  showSetupWelcome()

  // Get system username
  const os = await import('os')
  const defaultUsername = os.userInfo().username

  // Ask for username (with default)
  const username = await question(`Username [${defaultUsername}]: `)
  const finalUsername = username || defaultUsername

  console.log('')

  // Ask for passphrase
  while (true) {
    const passphrase1 = await password('Set a master passphrase (min 8 characters): ')

    if (passphrase1.length < 8) {
      error('Passphrase must be at least 8 characters. Please try again.')
      console.log('')
      continue
    }

    const passphrase2 = await password('Confirm passphrase: ')

    if (passphrase1 !== passphrase2) {
      error('Passphrases do not match. Please try again.')
      console.log('')
      continue
    }

    console.log('')
    return { username: finalUsername, passphrase: passphrase1 }
  }
}

/**
 * Show Vault status summary
 */
export function showStatusSummary(status: {
  initialized: boolean
  userId?: string
  storageType: string
  secretCount: number
}) {
  console.log(`
📊 Vault Status
══════════════════════════════════════════
  Initialized: ${status.initialized ? '✅ Yes' : '❌ No'}
  Storage:     ${status.storageType}
${status.userId ? `  User:        ${status.userId}` : ''}
  Secrets:     ${status.secretCount}
`)
}
