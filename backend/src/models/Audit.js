const mongoose = require('mongoose');

const AuditSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  file: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
  action: String, 
  meta: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Audit', AuditSchema);
