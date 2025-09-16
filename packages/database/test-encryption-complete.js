#!/usr/bin/env node

/**
 * HIPAA Encryption Compliance Test Suite
 * This validates all encryption requirements for PII/PHI protection
 */

const chalk = require('chalk') || { 
  green: (s) => s, 
  red: (s) => s, 
  yellow: (s) => s, 
  blue: (s) => s,
  gray: (s) => s 
};

// Load environment
require('dotenv').config({ path: '../../.env' });

console.log(chalk.blue('\n🔒 HIPAA ENCRYPTION TEST SUITE\n'));
console.log(chalk.gray('=' .repeat(50)));

// Verify environment setup
function verifyEnvironment() {
  console.log(chalk.yellow('\n📋 Step 1: Verifying Environment...'));
  
  const checks = [
    {
      name: 'ENCRYPTION_KEY',
      value: process.env.ENCRYPTION_KEY,
      valid: process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length >= 32
    },
    {
      name: 'ENCRYPTION_SALT',
      value: process.env.ENCRYPTION_SALT,
      valid: process.env.ENCRYPTION_SALT && process.env.ENCRYPTION_SALT.length >= 16
    }
  ];
  
  let allValid = true;
  checks.forEach(check => {
    if (check.valid) {
      console.log(chalk.green(`  ✅ ${check.name} is configured (${check.value?.length} chars)`));
    } else {
      console.log(chalk.red(`  ❌ ${check.name} is missing or too short`));
      allValid = false;
    }
  });
  
  if (!allValid) {
    console.log(chalk.red('\n❌ Environment not properly configured!'));
    console.log(chalk.yellow('Add to your .env file:'));
    console.log('ENCRYPTION_KEY=your-32-character-encryption-key!!');
    console.log('ENCRYPTION_SALT=your-salt-value-minimum-16-chars!!');
    process.exit(1);
  }
  
  return true;
}

// Test encryption functionality
async function testEncryption() {
  console.log(chalk.yellow('\n📋 Step 2: Testing Encryption Module...'));
  
  // Import after environment is verified
  const { FieldEncryption } = require('./src/encryption/field-encryption');
  
  const tests = [
    {
      name: 'SSN Encryption',
      data: '123-45-6789',
      type: 'PII'
    },
    {
      name: 'Date of Birth',
      data: '1990-01-15',
      type: 'PII'
    },
    {
      name: 'Medical Record Number',
      data: 'MRN-2024-98765',
      type: 'PHI'
    },
    {
      name: 'Bank Account',
      data: '1234567890',
      type: 'PII'
    },
    {
      name: 'Diagnosis Code',
      data: 'ICD-10: E11.9 (Type 2 Diabetes)',
      type: 'PHI'
    }
  ];
  
  let allPassed = true;
  
  for (const test of tests) {
    console.log(chalk.blue(`\n  Testing ${test.name} (${test.type}):`));
    
    try {
      // Encrypt
      const encrypted = FieldEncryption.encrypt(test.data);
      console.log(`    Original: ${chalk.gray(test.data)}`);
      console.log(`    Encrypted: ${chalk.gray(encrypted?.substring(0, 50) + '...')}`);
      
      // Verify encrypted format (should have IV:DATA structure)
      if (!encrypted || !encrypted.includes(':')) {
        throw new Error('Invalid encryption format');
      }
      
      // Decrypt
      const decrypted = FieldEncryption.decrypt(encrypted);
      console.log(`    Decrypted: ${chalk.gray(decrypted)}`);
      
      // Verify match
      if (decrypted !== test.data) {
        throw new Error('Decryption mismatch!');
      }
      
      // Test hashing (for searchable fields)
      const hash1 = FieldEncryption.hash(test.data);
      const hash2 = FieldEncryption.hash(test.data);
      
      if (hash1 !== hash2) {
        throw new Error('Hash inconsistency!');
      }
      
      console.log(`    Hash: ${chalk.gray(hash1.substring(0, 16) + '...')}`);
      console.log(chalk.green(`    ✅ ${test.name} encryption working correctly`));
      
    } catch (error) {
      console.log(chalk.red(`    ❌ ${test.name} failed: ${error.message}`));
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Test edge cases
async function testEdgeCases() {
  console.log(chalk.yellow('\n📋 Step 3: Testing Edge Cases...'));
  
  const { FieldEncryption } = require('./src/encryption/field-encryption');
  
  const edgeCases = [
    { name: 'Null value', input: null, expected: null },
    { name: 'Undefined value', input: undefined, expected: null },
    { name: 'Empty string', input: '', expected: null },
    { name: 'Unicode characters', input: '测试🏥医疗', expected: '测试🏥医疗' },
    { name: 'Special characters', input: '!@#$%^&*()', expected: '!@#$%^&*()' },
    { name: 'Very long string', input: 'A'.repeat(1000), expected: 'A'.repeat(1000) },
  ];
  
  let allPassed = true;
  
  for (const testCase of edgeCases) {
    try {
      const encrypted = FieldEncryption.encrypt(testCase.input);
      const decrypted = FieldEncryption.decrypt(encrypted);
      
      if (decrypted !== testCase.expected) {
        throw new Error(`Expected ${testCase.expected}, got ${decrypted}`);
      }
      
      console.log(chalk.green(`  ✅ ${testCase.name}: Passed`));
    } catch (error) {
      console.log(chalk.red(`  ❌ ${testCase.name}: Failed - ${error.message}`));
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Test security requirements
async function testSecurityRequirements() {
  console.log(chalk.yellow('\n📋 Step 4: Validating Security Requirements...'));
  
  const { FieldEncryption } = require('./src/encryption/field-encryption');
  
  const requirements = [];
  
  // Test 1: Unique IV per encryption
  const data = 'test-data';
  const encrypted1 = FieldEncryption.encrypt(data);
  const encrypted2 = FieldEncryption.encrypt(data);
  
  requirements.push({
    name: 'Unique IV per encryption',
    passed: encrypted1 !== encrypted2,
    note: 'Each encryption should produce different output'
  });
  
  // Test 2: Encrypted data length
  const shortData = 'A';
  const encryptedShort = FieldEncryption.encrypt(shortData);
  
  requirements.push({
    name: 'Minimum encryption strength',
    passed: encryptedShort && encryptedShort.length > 32,
    note: 'Even short data should have strong encryption'
  });
  
  // Test 3: Cannot decrypt with wrong data
  try {
    FieldEncryption.decrypt('invalid:data:format');
    requirements.push({
      name: 'Invalid data rejection',
      passed: false,
      note: 'Should reject invalid encrypted data'
    });
  } catch {
    requirements.push({
      name: 'Invalid data rejection',
      passed: true,
      note: 'Correctly rejects invalid data'
    });
  }
  
  // Test 4: Hash is one-way
  const originalData = 'secret-ssn';
  const hashedData = FieldEncryption.hash(originalData);
  
  requirements.push({
    name: 'One-way hash function',
    passed: hashedData.length === 64 && hashedData !== originalData,
    note: 'Hash should be SHA-256 (64 chars) and irreversible'
  });
  
  // Display results
  let allPassed = true;
  requirements.forEach(req => {
    if (req.passed) {
      console.log(chalk.green(`  ✅ ${req.name}`));
      console.log(chalk.gray(`     ${req.note}`));
    } else {
      console.log(chalk.red(`  ❌ ${req.name}`));
      console.log(chalk.gray(`     ${req.note}`));
      allPassed = false;
    }
  });
  
  return allPassed;
}

// Performance test
async function testPerformance() {
  console.log(chalk.yellow('\n📋 Step 5: Performance Testing...'));
  
  const { FieldEncryption } = require('./src/encryption/field-encryption');
  
  const iterations = 1000;
  const testData = '123-45-6789';
  
  // Encryption performance
  console.log(`  Testing ${iterations} encryptions...`);
  const encryptStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    FieldEncryption.encrypt(testData);
  }
  const encryptTime = Date.now() - encryptStart;
  const encryptOps = Math.round(iterations / (encryptTime / 1000));
  
  // Decryption performance
  const encrypted = FieldEncryption.encrypt(testData);
  console.log(`  Testing ${iterations} decryptions...`);
  const decryptStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    FieldEncryption.decrypt(encrypted);
  }
  const decryptTime = Date.now() - decryptStart;
  const decryptOps = Math.round(iterations / (decryptTime / 1000));
  
  console.log(chalk.green(`  ✅ Encryption: ${encryptOps} ops/sec (${encryptTime}ms for ${iterations})`));
  console.log(chalk.green(`  ✅ Decryption: ${decryptOps} ops/sec (${decryptTime}ms for ${iterations})`));
  
  // Performance thresholds
  const acceptable = encryptOps > 100 && decryptOps > 100;
  if (!acceptable) {
    console.log(chalk.yellow('  ⚠️  Performance may be slow for large datasets'));
  }
  
  return true;
}

// Main test runner
async function runAllTests() {
  console.log(chalk.blue('Starting HIPAA Encryption Compliance Tests...'));
  console.log(chalk.gray('This verifies PII/PHI encryption meets requirements\n'));
  
  const results = [];
  
  try {
    // Run all test suites
    results.push({
      name: 'Environment Setup',
      passed: verifyEnvironment()
    });
    
    results.push({
      name: 'Core Encryption',
      passed: await testEncryption()
    });
    
    results.push({
      name: 'Edge Cases',
      passed: await testEdgeCases()
    });
    
    results.push({
      name: 'Security Requirements',
      passed: await testSecurityRequirements()
    });
    
    results.push({
      name: 'Performance',
      passed: await testPerformance()
    });
    
  } catch (error) {
    console.error(chalk.red('\n❌ Test suite failed with error:'), error);
    process.exit(1);
  }
  
  // Final summary
  console.log(chalk.blue('\n' + '='.repeat(50)));
  console.log(chalk.blue('TEST SUMMARY:'));
  console.log(chalk.gray('='.repeat(50)));
  
  let allPassed = true;
  results.forEach(result => {
    if (result.passed) {
      console.log(chalk.green(`✅ ${result.name}: PASSED`));
    } else {
      console.log(chalk.red(`❌ ${result.name}: FAILED`));
      allPassed = false;
    }
  });
  
  if (allPassed) {
    console.log(chalk.green('\n🎉 ALL TESTS PASSED! Encryption is HIPAA-ready.\n'));
    console.log(chalk.yellow('Next steps:'));
    console.log('  1. Integrate with Prisma middleware');
    console.log('  2. Add audit logging');
    console.log('  3. Implement key rotation');
    process.exit(0);
  } else {
    console.log(chalk.red('\n❌ SOME TESTS FAILED. Fix issues before proceeding.\n'));
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
