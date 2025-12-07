require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const authRoutes = require('./src/routes/auth');
const fileRoutes = require('./src/routes/files');
const userRoutes = require('./src/routes/users');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();
app.use(express.json());

const allowedOrigins = [
  'http://localhost:3000',
  'https://share-x-j1r7.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`❌ CORS Blocked Origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/users', userRoutes);

app.use('/public', express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(`✅ MongoDB connected successfully`))
  .catch(err => console.log(`❌ MongoDB connection error: ${err.message}`));

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
