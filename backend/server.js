require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./src/routes/auth');
const fileRoutes = require('./src/routes/files');
const userRoutes = require('./src/routes/users');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/users', userRoutes);

app.use('/public', express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(`✅ MongoDB connected successfully`))
  .catch(err => console.log(`❌ MongoDB connection error: ${err.message}`));

app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});
