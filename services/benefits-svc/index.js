require('dotenv').config({ path: '../../.env' });
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

app.get('/api/plans', async (req, res) => {
  const plans = await prisma.plan.findMany();
  res.json(plans);
});

app.post('/api/enrollments', async (req, res) => {
  const { employeeId, planId } = req.body;
  const enrollment = await prisma.enrollment.create({
    data: {
      employeeId,
      planId,
      effectiveDate: new Date(),
      status: 'PENDING'
    }
  });
  res.json(enrollment);
});

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

const PORT = process.env.BENEFITS_SERVICE_PORT || 7002;
app.listen(PORT, () => console.log(`Benefits service running on port ${PORT}`));
