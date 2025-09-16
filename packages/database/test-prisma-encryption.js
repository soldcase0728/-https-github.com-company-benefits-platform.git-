// End-to-end test for Prisma encryption middleware
const prisma = require('./src/prisma-client').default;

async function run() {
  console.log('--- Prisma Encryption Middleware E2E Test ---');

  // Clean up any test data
  await prisma.dependent.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.plan.deleteMany({});

  // Create a plan
  const plan = await prisma.plan.create({
    data: {
      name: 'Test Medical',
      type: 'Medical',
      tier: 'Gold',
      description: 'Test plan',
    },
  });

  // Create an employee with PHI/PII
  const employee = await prisma.employee.create({
    data: {
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@example.com',
      ssn: '123-45-6789',
      dob: new Date('1990-01-01'),
      address: '123 Main St',
      phone: '555-123-4567',
    },
  });

  // Create a dependent
  const dependent = await prisma.dependent.create({
    data: {
      employeeId: employee.id,
      firstName: 'Bob',
      lastName: 'Smith',
      dob: new Date('2015-05-05'),
      relationship: 'Child',
      ssn: '987-65-4321',
    },
  });

  // Create an enrollment
  const enrollment = await prisma.enrollment.create({
    data: {
      employeeId: employee.id,
      planId: plan.id,
      coverage: 'Family',
      status: 'active',
      confirmation: 'CONFIRM-12345',
      submittedAt: new Date(),
    },
  });

  // Fetch and print employee (should be decrypted)
  const fetched = await prisma.employee.findUnique({ where: { id: employee.id } });
  console.log('Fetched employee:', fetched);

  // Fetch and print dependent (should be decrypted)
  const depFetched = await prisma.dependent.findUnique({ where: { id: dependent.id } });
  console.log('Fetched dependent:', depFetched);

  // Fetch and print enrollment (should be decrypted)
  const enrFetched = await prisma.enrollment.findUnique({ where: { id: enrollment.id } });
  console.log('Fetched enrollment:', enrFetched);

  // Direct DB check (raw query) to show encrypted values
  const { PrismaClient } = require('@prisma/client');
  const rawPrisma = new PrismaClient();
  const raw = await rawPrisma.$queryRawUnsafe('SELECT * FROM "Employee" WHERE id = $1', employee.id);
  console.log('Raw DB Employee (encrypted):', raw[0]);

  await prisma.$disconnect();
  await rawPrisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
