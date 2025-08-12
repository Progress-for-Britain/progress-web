import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.post('/api/register', async (req, res) => {
  const { username, password, email, address, avatarUrl } = req.body;
  try {
    const user = await prisma.user.create({
      data: { username, password, email, address, avatarUrl }
    });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'User creation failed' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (user && user.password === password) {
    return res.json(user);
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/newsletters', async (_req, res) => {
  const items = await prisma.newsletter.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(items);
});

app.post('/api/newsletters', async (req, res) => {
  const { title, content, userId } = req.body;
  try {
    const item = await prisma.newsletter.create({ data: { title, content, userId } });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: 'Newsletter creation failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
