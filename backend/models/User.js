import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  planType: { type: String, enum: ['none', 'starter', 'pro'], default: 'none' },
  razorpayCustomerId: { type: String },
  razorpaySubscriptionId: { type: String },
  subscriptionStatus: { type: String, enum: ['active', 'cancelled', 'past_due', 'created', 'authenticated', 'none'], default: 'none' },
  currentPeriodEnd: { type: Date }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
