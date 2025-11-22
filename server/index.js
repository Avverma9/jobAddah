const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes Connect Karein
app.use('/api/v1', require('./routes/route'));

// Basic env validation to catch empty/malformed MONGO_URI early and give a clear message
const { MONGO_URI } = process.env;
if (!MONGO_URI) {
  console.error('\nERROR: MONGO_URI is not set in the server .env file.');
  console.error('Please add your MongoDB connection string to server/.env.');
  console.error('Example (Atlas):');
  console.error('  MONGO_URI=mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.xyz.mongodb.net/<DBNAME>?retryWrites=true&w=majority\n');
  process.exit(1);
}

// Heuristic: if there's no username:password@ part, warn about missing password
const hasAuthPair = /:\/\/[^:]+:[^@]+@/.test(MONGO_URI);
if (!hasAuthPair) {
  console.error('\nERROR: MONGO_URI appears to be missing the password (or auth pair).');
  console.error('Ensure your connection string includes credentials in the form <username>:<password>@');
  console.error('Example: mongodb+srv://myuser:mypass@cluster0.xyz.mongodb.net/mydb');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));