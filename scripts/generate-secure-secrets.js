#!/usr/bin/env node

/**
 * Generate Secure Secrets for MaBar Application
 * 
 * This script generates cryptographically secure secrets for JWT and session management.
 * Run this script to generate new secrets when setting up the application or rotating keys.
 * 
 * Usage: node scripts/generate-secure-secrets.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 MaBar Secure Secret Generator');
console.log('================================\n');

// Generate cryptographically secure secrets
const generateSecrets = () => {
  return {
    jwtSecret: crypto.randomBytes(64).toString('hex'),
    sessionSecret: crypto.randomBytes(32).toString('hex'),
    csrfSecret: crypto.randomBytes(32).toString('hex'),
    encryptionKey: crypto.randomBytes(32).toString('hex')
  };
};

// Display secrets
const displaySecrets = (secrets) => {
  console.log('Generated Secure Secrets:');
  console.log('========================\n');
  
  console.log('JWT_SECRET (128 chars):');
  console.log(`"${secrets.jwtSecret}"\n`);
  
  console.log('SESSION_SECRET (64 chars):');
  console.log(`"${secrets.sessionSecret}"\n`);
  
  console.log('CSRF_SECRET (64 chars):');
  console.log(`"${secrets.csrfSecret}"\n`);
  
  console.log('ENCRYPTION_KEY (64 chars):');
  console.log(`"${secrets.encryptionKey}"\n`);
};

// Save secrets to file (optional)
const saveSecretsToFile = (secrets) => {
  const secretsDir = path.join(__dirname, '..', '.secrets');
  const secretsFile = path.join(secretsDir, `secrets-${Date.now()}.txt`);
  
  // Create .secrets directory if it doesn't exist
  if (!fs.existsSync(secretsDir)) {
    fs.mkdirSync(secretsDir, { recursive: true });
  }
  
  const content = `# MaBar Secure Secrets - Generated ${new Date().toISOString()}
# KEEP THESE SECRETS SECURE - DO NOT COMMIT TO VERSION CONTROL

JWT_SECRET="${secrets.jwtSecret}"
SESSION_SECRET="${secrets.sessionSecret}"
CSRF_SECRET="${secrets.csrfSecret}"
ENCRYPTION_KEY="${secrets.encryptionKey}"

# Instructions:
# 1. Copy these values to your .env file
# 2. Delete this file after copying
# 3. Never share these secrets
# 4. Rotate secrets regularly in production
`;
  
  fs.writeFileSync(secretsFile, content);
  console.log(`💾 Secrets saved to: ${secretsFile}`);
  console.log('⚠️  Remember to delete this file after copying secrets to .env\n');
};

// Validate existing secrets
const validateExistingSecrets = () => {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('ℹ️  No .env file found. Create one using .env.example as template.\n');
    return;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const jwtSecretMatch = envContent.match(/JWT_SECRET=["']?([^"'\n\r]+)["']?/);
  const sessionSecretMatch = envContent.match(/SESSION_SECRET=["']?([^"'\n\r]+)["']?/);
  
  console.log('🔍 Validating existing secrets in .env:');
  console.log('=====================================\n');
  
  if (jwtSecretMatch) {
    const jwtSecret = jwtSecretMatch[1];
    const isSecure = jwtSecret.length >= 64 && !/^[a-zA-Z0-9+/=]+$/.test(jwtSecret);
    console.log(`JWT_SECRET: ${isSecure ? '✅ Secure' : '❌ Weak'} (${jwtSecret.length} chars)`);
  } else {
    console.log('JWT_SECRET: ❌ Not found');
  }
  
  if (sessionSecretMatch) {
    const sessionSecret = sessionSecretMatch[1];
    const isSecure = sessionSecret.length >= 32 && !/^[a-zA-Z0-9+/=]+$/.test(sessionSecret);
    console.log(`SESSION_SECRET: ${isSecure ? '✅ Secure' : '❌ Weak'} (${sessionSecret.length} chars)`);
  } else {
    console.log('SESSION_SECRET: ❌ Not found');
  }
  
  console.log('\n');
};

// Main execution
const main = () => {
  const args = process.argv.slice(2);
  
  if (args.includes('--validate') || args.includes('-v')) {
    validateExistingSecrets();
    return;
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: node scripts/generate-secure-secrets.js [options]\n');
    console.log('Options:');
    console.log('  --validate, -v    Validate existing secrets in .env file');
    console.log('  --save, -s        Save generated secrets to file');
    console.log('  --help, -h        Show this help message\n');
    return;
  }
  
  // Validate existing secrets first
  validateExistingSecrets();
  
  // Generate new secrets
  const secrets = generateSecrets();
  displaySecrets(secrets);
  
  if (args.includes('--save') || args.includes('-s')) {
    saveSecretsToFile(secrets);
  }
  
  console.log('🔒 Security Recommendations:');
  console.log('============================');
  console.log('1. Use these secrets in your .env file');
  console.log('2. Never commit secrets to version control');
  console.log('3. Rotate secrets regularly in production');
  console.log('4. Use environment-specific secrets');
  console.log('5. Consider using a secrets management service\n');
  
  console.log('📋 Next Steps:');
  console.log('==============');
  console.log('1. Copy the generated secrets to your .env file');
  console.log('2. Restart your application');
  console.log('3. Test authentication functionality');
  console.log('4. Update production secrets separately\n');
};

// Run the script
main();