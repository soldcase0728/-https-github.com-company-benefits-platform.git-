import { Prisma } from '@prisma/client';
import { FieldEncryption } from './field-encryption';

// Map of model fields that require encryption (by model name)
const ENCRYPTED_FIELDS: Record<string, string[]> = {
  Employee: ['ssn', 'dob', 'address', 'phone'],
  Dependent: ['ssn', 'dob'],
  Enrollment: ['confirmation'],
  // Add more as needed
};

function encryptFields(model: string, data: Record<string, any>) {
  if (!ENCRYPTED_FIELDS[model]) return data;
  const encrypted = { ...data };
  for (const field of ENCRYPTED_FIELDS[model]) {
    if (field in encrypted && encrypted[field] != null) {
      encrypted[field] = FieldEncryption.encrypt(encrypted[field]);
    }
  }
  return encrypted;
}

function decryptFields(model: string, data: Record<string, any>) {
  if (!ENCRYPTED_FIELDS[model]) return data;
  const decrypted = { ...data };
  for (const field of ENCRYPTED_FIELDS[model]) {
    if (field in decrypted && decrypted[field] != null) {
      decrypted[field] = FieldEncryption.decrypt(decrypted[field]);
    }
  }
  return decrypted;
}

export function prismaEncryptionMiddleware() {
  return async (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<any>) => {
    const { model, action, args } = params;
    // Encrypt on create/update
    if ((action === 'create' || action === 'update' || action === 'upsert') && args?.data && model) {
      args.data = encryptFields(model, args.data);
    }
    // Encrypt on createMany
    if (action === 'createMany' && args?.data && model && Array.isArray(args.data)) {
      args.data = args.data.map((row: any) => encryptFields(model, row));
    }
    // Run the query
    const result = await next(params);
    // Decrypt on find/findMany
    if ((action === 'findUnique' || action === 'findFirst' || action === 'findMany') && result && model) {
      if (Array.isArray(result)) {
        return result.map((row) => decryptFields(model, row));
      } else {
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
