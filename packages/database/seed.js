const { PrismaClient } = require('@prisma/client');
const { FieldEncryption } = require('./src/encryption/field-encryption');
const prisma = new PrismaClient();

async function seed() {
  // Create plans
  const plans = await Promise.all([
    prisma.plan.create({
      data: {
        name: 'Basic Health',
        type: 'MEDICAL',
        tier: 'BRONZE',
        monthlyPremium: 200,
        deductible: 5000,
        maxOutOfPocket: 8000
      }
    }),
    prisma.plan.create({
      data: {
        name: 'Premium Health',
        type: 'MEDICAL',
        tier: 'GOLD',
        monthlyPremium: 500,
        deductible: 1000,
        maxOutOfPocket: 3000
      }
    }),
    prisma.plan.create({
      data: {
        name: 'Dental Plus',
        type: 'DENTAL',
        tier: 'SILVER',
        monthlyPremium: 50,
        deductible: 500,
        maxOutOfPocket: 2000
      }
    })
  ]);

  // Create test employees
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        ssn: FieldEncryption.encrypt('123-45-6789'),
        dateOfBirth: FieldEncryption.encrypt('1985-05-15'),
        employeeNumber: 'EMP001',
        department: 'Engineering',
        hireDate: new Date('2020-01-15')
      }
    }),
    prisma.employee.create({
      data: {
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        ssn: FieldEncryption.encrypt('987-65-4321'),
        dateOfBirth: FieldEncryption.encrypt('1990-08-22'),
        employeeNumber: 'EMP002',
        department: 'HR',
        hireDate: new Date('2019-06-01')
      }
    })
  ]);

  console.log('Seed data created:', {
    plans: plans.length,
    employees: employees.length
  });
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
