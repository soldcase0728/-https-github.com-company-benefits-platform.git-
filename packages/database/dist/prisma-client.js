"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma_encryption_middleware_1 = require("./encryption/prisma-encryption-middleware");
const prisma = new client_1.PrismaClient();
// Register the encryption middleware
prisma.$use((0, prisma_encryption_middleware_1.prismaEncryptionMiddleware)());
exports.default = prisma;
