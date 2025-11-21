const mongoose = require('mongoose');

const connectDB = async () => {
  const { MONGO_URI } = process.env;
  if (!MONGO_URI) {
    console.error('MONGO_URI not set in environment');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI, {
      // useUnifiedTopology and useNewUrlParser are defaults in mongoose v6+
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message || err);
    process.exit(1);
  }
};

module.exports = { connectDB };
