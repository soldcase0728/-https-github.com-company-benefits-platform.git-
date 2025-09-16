"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldEncryption = void 0;
var crypto_1 = require("crypto");
var FieldEncryption = /** @class */ (function () {
    function FieldEncryption() {
    }
    FieldEncryption.initialize = function () {
        var passphrase = process.env.ENCRYPTION_KEY || 'default-32-char-key-for-testing!!';
        var salt = process.env.ENCRYPTION_SALT || 'default-salt-16+!';
        this.key = (0, crypto_1.scryptSync)(passphrase, salt, 32);
        console.log('✅ Encryption initialized');
    };
    FieldEncryption.encrypt = function (text) {
        if (!text)
            return null;
        var iv = (0, crypto_1.randomBytes)(this.ivLength);
        var cipher = (0, crypto_1.createCipheriv)(this.algorithm, this.key, iv);
        var encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return "".concat(iv.toString('hex'), ":").concat(encrypted);
    };
    FieldEncryption.decrypt = function (encryptedText) {
        if (!encryptedText)
            return null;
        var _a = encryptedText.split(':'), ivHex = _a[0], encrypted = _a[1];
        var iv = Buffer.from(ivHex, 'hex');
        var decipher = (0, crypto_1.createDecipheriv)(this.algorithm, this.key, iv);
        var decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    };
    FieldEncryption.hash = function (text) {
        var crypto = require('crypto');
        return crypto.createHash('sha256').update(text + process.env.ENCRYPTION_SALT).digest('hex');
    };
    FieldEncryption.algorithm = 'aes-256-cbc';
    FieldEncryption.ivLength = 16;
    return FieldEncryption;
}());
exports.FieldEncryption = FieldEncryption;
FieldEncryption.initialize();
