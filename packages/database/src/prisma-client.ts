import { PrismaClient } from '@prisma/client';
import { prismaEncryptionMiddleware } from './encryption/prisma-encryption-middleware';

const prisma = new PrismaClient();

// Register the encryption middleware
prisma.$use(prismaEncryptionMiddleware());

export default prisma;
