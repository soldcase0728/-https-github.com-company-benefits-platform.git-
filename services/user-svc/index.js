require('dotenv').config({ path: '../../.env' });
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

app.post('/api/auth/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  // TODO: Save to database
  res.json({ message: 'User registered', email });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  // TODO: Verify from database
  const token = jwt.sign({ email }, process.env.JWT_SECRET || 'secret');
  res.json({ token });
});

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

const PORT = process.env.USER_SERVICE_PORT || 7001;
app.listen(PORT, () => console.log(`User service running on port ${PORT}`));
