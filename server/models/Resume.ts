import mongoose, { Schema } from 'mongoose';

const ResumeStateSchema = new Schema({
  id: {
    type: String,
    default: 'default_resume',
    unique: true,
  },
  activeBranchId: {
    type: String,
    required: true,
  },
  branches: {
    type: Map,
    of: Schema.Types.Mixed,
    required: true,
  },
}, {
  timestamps: true,
});

export const ResumeModel = mongoose.model('Resume', ResumeStateSchema);
