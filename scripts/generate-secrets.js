#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SecureSecretsGenerator {
  constructor() {
    this.envPath = path.join(process.cwd(), '.env');
    this.backupPath = path.join(process.cwd(), '.env.backup');
    this.dryRun = process.argv.includes('--dry-run');
    this.force = process.argv.includes('--force');
  }

  /**
   * Generate cryptographically secure secret using OpenSSL
   */
  generateSecret(bytes = 32) {
    try {
      const secret = execSync(`openssl rand -base64 ${bytes}`, { encoding: 'utf8' }).trim();
      
      // Validate minimum length
      if (secret.length < Math.ceil(bytes * 4 / 3)) {
        throw new Error(`Generated secret is too short: ${secret.length} characters`);
      }
      
      return secret;
    } catch (error) {
      if (error.message.includes('openssl')) {
        throw new Error('OpenSSL is not available. Please install OpenSSL to generate secure secrets.');
      }
      throw error;
    }
  }

  /**
   * Validate that .env is properly gitignored
   */
  validateGitignore() {
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    
    if (!fs.existsSync(gitignorePath)) {
      console.warn('⚠️  Warning: .gitignore file not found');
      return false;
    }
    
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    const hasEnvIgnored = gitignoreContent.includes('.env') && !gitignoreContent.includes('!.env.example');
    
    if (!hasEnvIgnored) {
      console.warn('⚠️  Warning: .env file may not be properly ignored by git');
      return false;
    }
    
    return true;
  }

  /**
   * Create backup of existing .env file
   */
  createBackup() {
    if (fs.existsSync(this.envPath)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const timestampedBackup = `${this.backupPath}.${timestamp}`;
      
      fs.copyFileSync(this.envPath, timestampedBackup);
      console.log(`✅ Created backup: ${path.basename(timestampedBackup)}`);
      return timestampedBackup;
    }
    return null;
  }

  /**
   * Parse existing .env file
   */
  parseEnvFile() {
    if (!fs.existsSync(this.envPath)) {
      throw new Error('.env file does not exist. Please create one first.');
    }
    
    const content = fs.readFileSync(this.envPath, 'utf8');
    const lines = content.split('\n');
    const env = {};
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    });
    
    return { content, env };
  }

  /**
   * Update secrets in .env content
   */
  updateSecrets(content, secrets) {
    let updatedContent = content;
    
    Object.entries(secrets).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const replacement = `${key}=${value}`;
      
      if (regex.test(updatedContent)) {
        updatedContent = updatedContent.replace(regex, replacement);
      } else {
        // Add new secret if it doesn't exist
        updatedContent += `\n${replacement}`;
      }
    });
    
    return updatedContent;
  }

  /**
   * Set proper file permissions for .env
   */
  setFilePermissions() {
    try {
      if (process.platform !== 'win32') {
        execSync(`chmod 600 "${this.envPath}"`);
        console.log('✅ Set .env file permissions to 600 (owner read/write only)');
      }
    } catch (error) {
      console.warn('⚠️  Warning: Could not set file permissions:', error.message);
    }
  }

  /**
   * Generate and update secrets
   */
  async generateSecrets() {
    console.log('🔐 MaBar Secure Secrets Generator\n');
    
    // Validate prerequisites
    this.validateGitignore();
    
    try {
      // Test OpenSSL availability
      this.generateSecret(1);
      console.log('✅ OpenSSL is available');
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
    
    // Parse existing .env
    let envData;
    try {
      envData = this.parseEnvFile();
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
    
    // Check if secrets already exist and are secure
    const existingSecrets = {
      JWT_SECRET: envData.env.JWT_SECRET,
      SESSION_SECRET: envData.env.SESSION_SECRET
    };
    
    const needsUpdate = Object.entries(existingSecrets).some(([key, value]) => {
      if (!value) return true;
      if (value.includes('change_this') || value.includes('your_')) return true;
      if (key === 'JWT_SECRET' && value.length < 64) return true;
      if (key === 'SESSION_SECRET' && value.length < 32) return true;
      return false;
    });
    
    if (!needsUpdate && !this.force) {
      console.log('✅ Secure secrets already exist. Use --force to regenerate.');
      return;
    }
    
    // Generate new secrets
    console.log('🔄 Generating new secure secrets...');
    const newSecrets = {
      JWT_SECRET: this.generateSecret(64),  // 64 bytes for JWT
      SESSION_SECRET: this.generateSecret(32)  // 32 bytes for session
    };
    
    console.log('✅ Generated JWT_SECRET (64 bytes)');
    console.log('✅ Generated SESSION_SECRET (32 bytes)');
    
    if (this.dryRun) {
      console.log('\n🔍 DRY RUN - Would update:');
      Object.entries(newSecrets).forEach(([key, value]) => {
        console.log(`${key}=${value.substring(0, 16)}...`);
      });
      return;
    }
    
    // Create backup
    this.createBackup();
    
    // Update .env file
    const updatedContent = this.updateSecrets(envData.content, newSecrets);
    fs.writeFileSync(this.envPath, updatedContent);
    
    // Set proper permissions
    this.setFilePermissions();
    
    console.log('\n✅ Successfully updated .env file with secure secrets');
    console.log('🔒 Secrets are cryptographically secure and ready for production');
    console.log('\n📋 Next steps:');
    console.log('1. Restart your application to use the new secrets');
    console.log('2. Update your production environment with these secrets');
    console.log('3. Ensure .env is not committed to version control');
  }
}

// Main execution
if (require.main === module) {
  const generator = new SecureSecretsGenerator();
  
  // Show help
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
🔐 MaBar Secure Secrets Generator

Usage: npm run generate-secrets [options]

Options:
  --dry-run    Show what would be generated without making changes
  --force      Force regeneration even if secure secrets exist
  --help, -h   Show this help message

Examples:
  npm run generate-secrets           # Generate secrets if needed
  npm run generate-secrets -- --dry-run    # Preview changes
  npm run generate-secrets -- --force      # Force regeneration
`);
    process.exit(0);
  }
  
  generator.generateSecrets().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = SecureSecretsGenerator;