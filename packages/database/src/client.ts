import { PrismaClient } from '@prisma/client';
import { logger } from '@benefits/observability';

let prisma: PrismaClient;

export function getPrismaClient(tenantId?: string): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'error', 'warn'] 
        : ['error'],
    });
    
    prisma.$use(async (params, next) => {
      if (tenantId && params.model && params.action.startsWith('find')) {
        params.args = params.args || {};
        params.args.where = params.args.where || {};
        params.args.where.tenantId = tenantId;
      }
      
      const result = await next(params);
      return result;
    });
  }
  
  return prisma;
}

export async function connectDatabase(): Promise<void> {
  try {
    await getPrismaClient().$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('Database disconnected');
  }
}
