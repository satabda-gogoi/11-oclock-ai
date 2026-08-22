import mongoose from 'mongoose';

const IntegrationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  appId: { type: mongoose.Schema.Types.ObjectId, ref: 'MasterApp', required: true },
  authStatus: { type: String, enum: ['authorized', 'revoked'], default: 'authorized' },
  profileName: { type: String },
  
  // 💡 Overhauled structural field block to map encrypted artifacts safely
  encryptedData: { type: String, required: true },
  iv: { type: String, required: true },
  authTag: { type: String, required: true }
}, { timestamps: true });

IntegrationSchema.index({ userId: 1, appId: 1 });

export default mongoose.model('Integration', IntegrationSchema);