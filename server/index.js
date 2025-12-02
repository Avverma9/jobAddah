require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');

const app = express();

// connect to MongoDB (connectDB validates MONGO_URI)
connectDB();

// Allow all origins and allow credentials so frontends on any origin can use the HttpOnly cookie.
// We set origin: true to echo the request origin (can't set '*' when credentials=true).
app.use(cors({ origin: "*", credentials: false }));
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));

// routes
app.use('/api/v1', require('./routes/index'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));