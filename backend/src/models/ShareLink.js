const mongoose = require('mongoose');

const ShareLinkSchema = new mongoose.Schema({
  file: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
  token: { type: String, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: Date, 
  allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  restrictedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
}, { timestamps: true });

module.exports = mongoose.model('ShareLink', ShareLinkSchema);
