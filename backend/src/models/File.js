const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  originalName: String,
  storageName: String, 
  mimeType: String,
  size: Number,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  compressed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', FileSchema);
