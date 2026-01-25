import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!MONGO_URI) throw new Error('Please set MONGODB_URI (or MONGO_URI) in env');

mongoose.set('strictQuery', false);

export async function connectDB() {
  try {
    // Use a small timeout so devs get quick feedback when DNS/Network is blocked
    return await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (err) {
    // Provide a clearer, actionable error message for common SRV/DNS issues
    console.error('Failed to connect to MongoDB. Please verify your MONGODB_URI/MONGO_URI.');
    console.error('MONGO_URI:', String(MONGO_URI).startsWith('mongodb') ? '[redacted]' : MONGO_URI);
    console.error('Error:', err && err.message ? err.message : err);

    if (err && /querySrv/i.test(String(err.message || ''))) {
      console.error('Detected SRV DNS lookup error (querySrv). If you are using a mongodb+srv URI, try one of:');
      console.error('- Ensure outbound DNS resolution is available (internet access).');
      console.error('- Use a standard mongodb://host:port connection string instead of mongodb+srv:// for local development.');
      console.error('- Whitelist your IP in Atlas and ensure SRV records are reachable.');
    }

    throw err;
  }
}
