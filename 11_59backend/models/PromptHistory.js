// models/PromptHistory.js
import mongoose from 'mongoose';

const PromptHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  inputPrompt: { type: String, required: true },
  generatedContent: { type: String, default: "" },
  status: { 
    type: String, 
    enum: ['processing', 'completed', 'failed'], 
    default: 'processing' 
  },
  platform: { type: String },
  
  // 💡 NEW MULTIMODAL ATTACHMENT SCHEMA VECTOR
  attachments: [
    {
      fileUrl: { type: String, required: true },
      fileType: { type: String, enum: ['image', 'document'], required: true },
      fileName: { type: String, required: true },
      storagePath: { type: String, required: true } // 👈 Vital for the Cache-and-Destroy auto-cleanup loop later
    }
  ]
}, { timestamps: true });

PromptHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('PromptHistory', PromptHistorySchema);