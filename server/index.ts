import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
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

app.get('/', (req, res) => {
  res.send('Resume Builder Backend is running');
});

// GET endpoint for resume
app.get('/api/resume', async (req, res) => {
  try {
    const resume = await ResumeModel.findOne({ id: 'default_resume' });
    if (!resume) {
      // If not found, return status 200 with an empty object
      return res.status(200).json({});
    }
    return res.status(200).json({
      activeBranchId: resume.activeBranchId,
      branches: resume.branches,
    });
  } catch (error) {
    console.error('Error in GET /api/resume:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST endpoint for resume
app.post('/api/resume', async (req, res) => {
  try {
    const { activeBranchId, branches } = req.body;
    if (!activeBranchId || !branches) {
      return res.status(400).json({ error: 'Missing activeBranchId or branches' });
    }

    const updated = await ResumeModel.findOneAndUpdate(
      { id: 'default_resume' },
      { activeBranchId, branches },
      { upsert: true, returnDocument: 'after' }
    );

    return res.status(200).json({ message: 'Saved successfully', data: updated });
  } catch (error) {
    console.error('Error in POST /api/resume:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
    process.exit(1);
  });
