"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldEncryption = void 0;
const crypto_1 = require("crypto");
class FieldEncryption {
    static initialize() {
        const passphrase = process.env.ENCRYPTION_KEY || 'default-32-char-key-for-testing!!';
        const salt = process.env.ENCRYPTION_SALT || 'default-salt-16+!';
        this.key = (0, crypto_1.scryptSync)(passphrase, salt, 32);
        console.log('✅ Encryption initialized');
    }
    static encrypt(text) {
        if (!text)
            return null;
        const iv = (0, crypto_1.randomBytes)(this.ivLength);
        const cipher = (0, crypto_1.createCipheriv)(this.algorithm, this.key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    }
    static decrypt(encryptedText) {
        if (!encryptedText)
            return null;
        const [ivHex, encrypted] = encryptedText.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = (0, crypto_1.createDecipheriv)(this.algorithm, this.key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    static hash(text) {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(text + process.env.ENCRYPTION_SALT).digest('hex');
    }
}
exports.FieldEncryption = FieldEncryption;
FieldEncryption.algorithm = 'aes-256-cbc';
FieldEncryption.ivLength = 16;
FieldEncryption.initialize();
