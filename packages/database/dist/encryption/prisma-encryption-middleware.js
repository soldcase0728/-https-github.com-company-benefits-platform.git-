"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaEncryptionMiddleware = prismaEncryptionMiddleware;
const field_encryption_1 = require("./field-encryption");
// Map of model fields that require encryption (by model name)
const ENCRYPTED_FIELDS = {
    Employee: ['ssn', 'dob', 'address', 'phone'],
    Dependent: ['ssn', 'dob'],
    Enrollment: ['confirmation'],
    // Add more as needed
};
function encryptFields(model, data) {
    if (!ENCRYPTED_FIELDS[model])
        return data;
    const encrypted = Object.assign({}, data);
    for (const field of ENCRYPTED_FIELDS[model]) {
        if (field in encrypted && encrypted[field] != null) {
            encrypted[field] = field_encryption_1.FieldEncryption.encrypt(encrypted[field]);
        }
    }
    return encrypted;
}
function decryptFields(model, data) {
    if (!ENCRYPTED_FIELDS[model])
        return data;
    const decrypted = Object.assign({}, data);
    for (const field of ENCRYPTED_FIELDS[model]) {
        if (field in decrypted && decrypted[field] != null) {
            decrypted[field] = field_encryption_1.FieldEncryption.decrypt(decrypted[field]);
        }
    }
    return decrypted;
}
function prismaEncryptionMiddleware() {
    return async (params, next) => {
        const { model, action, args } = params;
        // Encrypt on create/update
        if ((action === 'create' || action === 'update' || action === 'upsert') && (args === null || args === void 0 ? void 0 : args.data) && model) {
            args.data = encryptFields(model, args.data);
        }
        // Encrypt on createMany
        if (action === 'createMany' && (args === null || args === void 0 ? void 0 : args.data) && model && Array.isArray(args.data)) {
            args.data = args.data.map((row) => encryptFields(model, row));
        }
        // Run the query
        const result = await next(params);
        // Decrypt on find/findMany
        if ((action === 'findUnique' || action === 'findFirst' || action === 'findMany') && result && model) {
            if (Array.isArray(result)) {
                return result.map((row) => decryptFields(model, row));
            }
            else {
                return decryptFields(model, result);
            }
        }
        // Decrypt on update
        if ((action === 'update' || action === 'upsert') && result && model) {
            return decryptFields(model, result);
        }
        return result;
    };
}
