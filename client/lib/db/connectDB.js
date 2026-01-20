import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!MONGO_URI) throw new Error('Please set MONGODB_URI (or MONGO_URI) in env');

mongoose.set('strictQuery', false);

export async function connectDB() {
  // Directly connect each time (no global caching)
  return mongoose.connect(MONGO_URI);
}
