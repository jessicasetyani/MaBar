#!/usr/bin/env node

/**
 * MaBar Security Audit Script
 * 
 * Performs comprehensive security checks on the application
 * Run this script regularly to ensure security compliance
 * 
 * Usage: node scripts/security-audit.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔍 MaBar Security Audit');
console.log('=======================\n');

class SecurityAuditor {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
    this.projectRoot = path.join(__dirname, '..');
  }

  addIssue(severity, category, message, fix = null) {
    const issue = { severity, category, message, fix };
    if (severity === 'CRITICAL' || severity === 'HIGH') {
      this.issues.push(issue);
    } else {
      this.warnings.push(issue);
    }
  }

  addPass(category, message) {
    this.passed.push({ category, message });
  }

  // Check for exposed secrets
  checkExposedSecrets() {
    console.log('🔐 Checking for exposed secrets...');
    
    const sensitiveFiles = ['.env', '.env.local', '.env.production'];
    const backupPatterns = ['.env.backup*', '*.backup', '*.bak'];
    
    // Check for .env files in git
    if (fs.existsSync(path.join(this.projectRoot, '.git'))) {
      try {
        const { execSync } = require('child_process');
        const trackedFiles = execSync('git ls-files', { cwd: this.projectRoot }).toString().split('\n');
        
        sensitiveFiles.forEach(file => {
          if (trackedFiles.includes(file)) {
            this.addIssue('CRITICAL', 'Secrets', 
              `${file} is tracked in git`, 
              `Run: git rm --cached ${file} && git commit -m "Remove ${file} from tracking"`);
          } else {
            this.addPass('Secrets', `${file} is not tracked in git`);
          }
        });
      } catch (error) {
        console.log('   ⚠️  Could not check git status');
      }
    }
    
    // Check for backup files
    const files = fs.readdirSync(this.projectRoot);
    files.forEach(file => {
      if (file.includes('.env.backup') || file.endsWith('.backup') || file.endsWith('.bak')) {
        this.addIssue('HIGH', 'Secrets', 
          `Backup file found: ${file}`, 
          `Delete the file: rm ${file}`);
      }
    });
    
    // Check .env file security
    const envPath = path.join(this.projectRoot, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check for weak secrets
      const jwtMatch = envContent.match(/JWT_SECRET=["']?([^"'\n\r]+)["']?/);
      if (jwtMatch) {
        const secret = jwtMatch[1];
        if (secret.length < 32) {
          this.addIssue('HIGH', 'Secrets', 'JWT_SECRET is too short (< 32 chars)');
        } else if (secret === 'your_jwt_secret_here' || secret.includes('change_this')) {
          this.addIssue('CRITICAL', 'Secrets', 'JWT_SECRET is using default/placeholder value');
        } else {
          this.addPass('Secrets', 'JWT_SECRET appears to be properly configured');
        }
      }
      
      // Check for hardcoded API keys patterns
      const apiKeyPatterns = [
        /AIza[0-9A-Za-z-_]{35}/g, // Google API keys
        /sk-[a-zA-Z0-9]{48}/g,    // OpenAI-style keys
        /[0-9a-f]{32}/g           // Generic 32-char hex keys
      ];
      
      apiKeyPatterns.forEach(pattern => {
        const matches = envContent.match(pattern);
        if (matches) {
          matches.forEach(match => {
            if (!match.includes('your_') && !match.includes('_here')) {
              this.addIssue('CRITICAL', 'Secrets', 
                `Potential live API key found: ${match.substring(0, 10)}...`);
            }
          });
        }
      });
    }
  }

  // Check dependencies for vulnerabilities
  checkDependencies() {
    console.log('📦 Checking dependencies...');
    
    try {
      const { execSync } = require('child_process');
      const auditResult = execSync('npm audit --json', { cwd: this.projectRoot }).toString();
      const audit = JSON.parse(auditResult);
      
      if (audit.vulnerabilities) {
        Object.entries(audit.vulnerabilities).forEach(([pkg, vuln]) => {
          const severity = vuln.severity.toUpperCase();
          this.addIssue(severity, 'Dependencies', 
            `${pkg}: ${vuln.title}`, 
            'Run: npm audit fix');
        });
      } else {
        this.addPass('Dependencies', 'No known vulnerabilities found');
      }
    } catch (error) {
      console.log('   ⚠️  Could not run npm audit');
    }
  }

  // Check file permissions
  checkFilePermissions() {
    console.log('📁 Checking file permissions...');
    
    // Check if we're on a filesystem that supports Unix permissions
    try {
      const { execSync } = require('child_process');
      const fsType = execSync('df -T . | tail -1 | awk "{print $2}"', { cwd: this.projectRoot }).toString().trim();
      
      if (fsType === 'fuseblk' || fsType === 'ntfs' || fsType === 'vfat') {
        this.addPass('Permissions', 'NTFS/FAT filesystem detected - Unix permissions not applicable');
        return;
      }
    } catch (error) {
      // Continue with permission check if we can't determine filesystem
    }
    
    const sensitiveFiles = [
      '.env',
      'backend/config/database.js',
      'backend/middleware/auth.js'
    ];
    
    sensitiveFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const mode = stats.mode & parseInt('777', 8);
        
        if (mode & parseInt('044', 8)) { // World readable
          this.addIssue('MEDIUM', 'Permissions', 
            `${file} is world-readable`, 
            `Run: chmod 600 ${file}`);
        } else {
          this.addPass('Permissions', `${file} has appropriate permissions`);
        }
      }
    });
  }

  // Check security middleware implementation
  checkSecurityMiddleware() {
    console.log('🛡️  Checking security middleware...');
    
    const serverPath = path.join(this.projectRoot, 'backend/server.js');
    if (fs.existsSync(serverPath)) {
      const serverContent = fs.readFileSync(serverPath, 'utf8');
      
      const requiredMiddleware = [
        { name: 'helmet', pattern: /helmet\(/ },
        { name: 'cors', pattern: /cors\(/ },
        { name: 'rate limiting', pattern: /rateLimit/ },
        { name: 'CSRF protection', pattern: /csrf/ },
        { name: 'mongo sanitize', pattern: /mongoSanitize/ }
      ];
      
      requiredMiddleware.forEach(middleware => {
        if (middleware.pattern.test(serverContent)) {
          this.addPass('Middleware', `${middleware.name} is implemented`);
        } else {
          this.addIssue('HIGH', 'Middleware', 
            `${middleware.name} is not implemented`);
        }
      });
    }
  }

  // Check for common security misconfigurations
  checkConfigurations() {
    console.log('⚙️  Checking configurations...');
    
    // Check package.json for security-related scripts
    const packagePath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      if (packageJson.scripts && packageJson.scripts.audit) {
        this.addPass('Configuration', 'Security audit script is configured');
      } else {
        this.addIssue('LOW', 'Configuration', 
          'No security audit script configured',
          'Add "audit": "npm audit" to package.json scripts');
      }
    }
    
    // Check for .gitignore
    const gitignorePath = path.join(this.projectRoot, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      
      const requiredPatterns = ['.env', 'node_modules', '*.log'];
      requiredPatterns.forEach(pattern => {
        if (gitignoreContent.includes(pattern)) {
          this.addPass('Configuration', `${pattern} is in .gitignore`);
        } else {
          this.addIssue('MEDIUM', 'Configuration', 
            `${pattern} is not in .gitignore`);
        }
      });
    }
  }

  // Generate security report
  generateReport() {
    console.log('\n📊 Security Audit Report');
    console.log('========================\n');
    
    // Summary
    const totalIssues = this.issues.length;
    const totalWarnings = this.warnings.length;
    const totalPassed = this.passed.length;
    
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`⚠️  Warnings: ${totalWarnings}`);
    console.log(`❌ Issues: ${totalIssues}\n`);
    
    // Critical and High issues
    if (this.issues.length > 0) {
      console.log('🚨 CRITICAL & HIGH PRIORITY ISSUES:');
      console.log('===================================');
      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.severity}] ${issue.category}: ${issue.message}`);
        if (issue.fix) {
          console.log(`   Fix: ${issue.fix}`);
        }
        console.log('');
      });
    }
    
    // Warnings
    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      console.log('=============');
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. [${warning.severity}] ${warning.category}: ${warning.message}`);
        if (warning.fix) {
          console.log(`   Fix: ${warning.fix}`);
        }
        console.log('');
      });
    }
    
    // Overall assessment
    console.log('🎯 OVERALL ASSESSMENT:');
    console.log('======================');
    
    if (totalIssues === 0 && totalWarnings === 0) {
      console.log('✅ EXCELLENT: No security issues found!');
    } else if (totalIssues === 0) {
      console.log('✅ GOOD: No critical issues, but some warnings to address');
    } else if (totalIssues <= 2) {
      console.log('⚠️  FAIR: Some issues need attention');
    } else {
      console.log('❌ POOR: Multiple security issues require immediate attention');
    }
    
    console.log(`\n📈 Security Score: ${Math.max(0, 100 - (totalIssues * 20) - (totalWarnings * 5))}/100`);
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('===================');
    console.log('1. Address all CRITICAL and HIGH priority issues immediately');
    console.log('2. Run this audit regularly (weekly recommended)');
    console.log('3. Keep dependencies updated');
    console.log('4. Use environment-specific configurations');
    console.log('5. Implement automated security testing in CI/CD');
    
    return {
      passed: totalPassed,
      warnings: totalWarnings,
      issues: totalIssues,
      score: Math.max(0, 100 - (totalIssues * 20) - (totalWarnings * 5))
    };
  }

  // Run all security checks
  async runAudit() {
    this.checkExposedSecrets();
    this.checkDependencies();
    this.checkFilePermissions();
    this.checkSecurityMiddleware();
    this.checkConfigurations();
    
    return this.generateReport();
  }
}

// Run the audit
const auditor = new SecurityAuditor();
auditor.runAudit().then(result => {
  process.exit(result.issues > 0 ? 1 : 0);
}).catch(error => {
  console.error('Audit failed:', error);
  process.exit(1);
});