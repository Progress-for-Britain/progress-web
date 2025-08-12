import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
app.use(express.json());

app.post('/register', async (req, res) => {
  try {
    const user = await prisma.user.create({ data: req.body });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.password === password) {
    res.json({ message: 'Login successful', user });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/newsletters', async (_req, res) => {
  const newsletters = await prisma.newsletter.findMany();
  res.json(newsletters);
});

app.post('/newsletters', async (req, res) => {
  try {
    const newsletter = await prisma.newsletter.create({ data: req.body });
    res.json(newsletter);
  } catch (e) {
    res.status(400).json({ error: 'Could not create newsletter' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
