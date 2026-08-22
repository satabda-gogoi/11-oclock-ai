import mongoose from 'mongoose';

const TempOauthStateSchema = new mongoose.Schema({
  state: { type: String, required: true, unique: true },
  codeVerifier: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // TTL 10 minutes
});

export default mongoose.model('TempOauthState', TempOauthStateSchema);
