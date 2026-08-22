import mongoose from 'mongoose';

const MONGO_URI = 'mongodb+srv://devsatabda:Satabdacodex123@cluster0.zratv.mongodb.net/horizon_db?retryWrites=true&w=majority';

const PromptHistorySchema = new mongoose.Schema({
  userId: String,
  title: String,
  inputPrompt: String,
  generatedContent: String,
  status: String,
  platform: String
}, { timestamps: true });

const PromptHistory = mongoose.model('PromptHistory', PromptHistorySchema);

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");
  
  const latest = await PromptHistory.find({}).sort({ createdAt: -1 }).limit(5);
  console.log("LATEST DOCUMENTS:");
  latest.forEach((doc, idx) => {
    console.log(`\n--- DOCUMENT #${idx + 1} ---`);
    console.log(`ID: ${doc._id}`);
    console.log(`Title: ${doc.title}`);
    console.log(`Status: ${doc.status}`);
    console.log(`Platform: ${doc.platform}`);
    console.log(`GeneratedContent: "${doc.generatedContent}"`);
    console.log(`Created At: ${doc.createdAt}`);
  });
  
  await mongoose.disconnect();
}

main().catch(console.error);
