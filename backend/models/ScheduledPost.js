import mongoose from 'mongoose';

const ScheduledPostSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  prompt: { type: String, required: true },
  platform: { type: String, required: true }, // e.g., 'linkedin', 'twitter'
  scheduleType: { 
    type: String, 
    enum: ['once', 'daily'], 
    default: 'once' 
  },
  scheduledTime: { type: Date }, // Used if scheduleType is 'once'
  dailyTime: { type: String }, // Used if scheduleType is 'daily' (format "HH:MM")
  timeZone: { type: String, default: 'UTC' }, // User's local timezone name (e.g. 'America/New_York')
  status: { 
    type: String, 
    enum: ['scheduled', 'processing', 'completed', 'failed'], 
    default: 'scheduled' 
  },
  attachments: [
    {
      fileUrl: { type: String, required: true },
      fileType: { type: String, enum: ['image', 'document'], required: true },
      fileName: { type: String, required: true },
      storagePath: { type: String, required: true }
    }
  ],
  lastRun: { type: Date },
  historyRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'PromptHistory' }
}, { timestamps: true });

ScheduledPostSchema.index({ status: 1, scheduledTime: 1 });
ScheduledPostSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('ScheduledPost', ScheduledPostSchema);
