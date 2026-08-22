import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MasterAppSchema = new mongoose.Schema({
  name: String,
  iconKey: String,
  isActive: Boolean,
  requiredFields: Array
});

const MasterApp = mongoose.model('MasterApp', MasterAppSchema);

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const apps = await MasterApp.find({});
  console.log("APPS:");
  console.log(JSON.stringify(apps, null, 2));

  await mongoose.disconnect();
}

main().catch(console.error);
