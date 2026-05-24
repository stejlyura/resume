import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { ResumeModel } from './models/Resume';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not defined.');
  process.exit(1);
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));

let isConnected = false;

async function connectToDatabase() {
  if (isConnected) return;
  if (mongoose.connections[0].readyState) {
    isConnected = true;
    return;
  }
  await mongoose.connect(MONGODB_URI!);
  isConnected = true;
  console.log('Connected to MongoDB Atlas');
}

// Database middleware
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
    return;
  }
});

const SECRET = process.env.PASSWORD || 'fallback_dev_secret_key';

function generateToken(username: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ username, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

function verifyToken(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [header, payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');
    if (signature !== expectedSignature) return false;
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (decodedPayload.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

const authMiddleware: express.RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
    return;
  }
  const token = authHeader.split(' ')[1];
  if (!verifyToken(token)) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    return;
  }
  next();
};

app.get('/', (req, res) => {
  res.send('Resume Builder Backend is running');
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { login, password } = req.body;
  const expectedLogin = process.env.LOGIN || 'admin';
  const expectedPassword = process.env.PASSWORD;

  if (!expectedPassword) {
    res.status(500).json({ error: 'Server authentication is not configured in .env' });
    return;
  }

  if (login === expectedLogin && password === expectedPassword) {
    const token = generateToken(login);
    res.status(200).json({ token });
    return;
  } else {
    res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
    return;
  }
});

// Verify token endpoint
app.get('/api/auth/verify', authMiddleware, (req, res) => {
  res.status(200).json({ valid: true });
  return;
});

// GET endpoint for resume
app.get('/api/resume', authMiddleware, async (req, res) => {
  try {
    const resume = await ResumeModel.findOne({ id: 'default_resume' });
    if (!resume) {
      // If not found, return status 200 with an empty object
      res.status(200).json({});
      return;
    }
    res.status(200).json({
      activeBranchId: resume.activeBranchId,
      branches: resume.branches,
    });
    return;
  } catch (error) {
    console.error('Error in GET /api/resume:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
});

// POST endpoint for resume
app.post('/api/resume', authMiddleware, async (req, res) => {
  try {
    const { activeBranchId, branches } = req.body;
    if (!activeBranchId || !branches) {
      res.status(400).json({ error: 'Missing activeBranchId or branches' });
      return;
    }

    const updated = await ResumeModel.findOneAndUpdate(
      { id: 'default_resume' },
      { activeBranchId, branches },
      { upsert: true, returnDocument: 'after' }
    );

    res.status(200).json({ message: 'Saved successfully', data: updated });
    return;
  } catch (error) {
    console.error('Error in POST /api/resume:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
});

if (!process.env.VERCEL) {
  connectToDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }).catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
    process.exit(1);
  });
}

export default app;
