import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

export class FieldEncryption {
  private static algorithm = 'aes-256-cbc';
  private static ivLength = 16;
  private static key: Buffer;

  static initialize() {
    const passphrase = process.env.ENCRYPTION_KEY || 'default-32-char-key-for-testing!!';
    const salt = process.env.ENCRYPTION_SALT || 'default-salt-16+!';
    
    this.key = scryptSync(passphrase, salt, 32);
    console.log('✅ Encryption initialized');
  }

  static encrypt(text: string | null | undefined): string | null {
    if (!text) return null;
    
    const iv = randomBytes(this.ivLength);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }

  static decrypt(encryptedText: string | null): string | null {
    if (!encryptedText) return null;
    
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv(this.algorithm, this.key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  static hash(text: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(text + process.env.ENCRYPTION_SALT).digest('hex');
  }
}

FieldEncryption.initialize();
