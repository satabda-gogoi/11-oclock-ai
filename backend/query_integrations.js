import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const IntegrationSchema = new mongoose.Schema({
  userId: String,
  appId: mongoose.Schema.Types.ObjectId,
  authStatus: String
});

const Integration = mongoose.model('Integration', IntegrationSchema);

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const integrations = await Integration.find({});
  console.log("INTEGRATIONS:");
  console.log(JSON.stringify(integrations, null, 2));

  await mongoose.disconnect();
}

main().catch(console.error);
