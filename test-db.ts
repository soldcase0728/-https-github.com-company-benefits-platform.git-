import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    const userCount = await prisma.user.count();
    const planCount = await prisma.plan.count();
    
    console.log(`📊 Current data: ${userCount} users, ${planCount} plans`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testConnection();
