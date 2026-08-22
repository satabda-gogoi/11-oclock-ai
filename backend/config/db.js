import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`🍃 MongoDB Matrix Connected Safely: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Initialization Failure: ${error.message}`);
    process.exit(1); // Crash the process instantly to alert the dev team
  }
};

export default connectDB;