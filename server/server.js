require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();

// connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// routes
app.use('/api/jobs', require('./routes/route'));
// auth routes (register/login/profile)
app.use('/api/auth', require('./routes/auth'));
// admin routes (manage users and permissions)
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
