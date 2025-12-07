const express = require('express');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { v4: uuidv4 } = require('uuid');

const auth = require('../middleware/auth');
const { upload } = require('../utils/storage');
const File = require('../models/File');
const ShareLink = require('../models/ShareLink');
const Audit = require('../models/Audit');
const router = express.Router();
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

router.post('/upload', auth, upload.array('files', 20), async (req, res) => {
  try {
    const saved = [];
    for (const f of req.files) {
      const compress = true;
      let storageName = f.filename;
      let compressed = false;

      if (compress) {
        const filePath = path.join(UPLOAD_DIR, f.filename);
        const gzName = f.filename + '.gz';
        const gzPath = path.join(UPLOAD_DIR, gzName);
        const input = fs.createReadStream(filePath);
        const output = fs.createWriteStream(gzPath);
        const gzip = zlib.createGzip();
        await new Promise((resolve, reject) => {
          input.pipe(gzip).pipe(output).on('finish', resolve).on('error', reject);
        });
        fs.unlinkSync(filePath);
        storageName = gzName;
        compressed = true;
      }

      const fileDoc = await File.create({
        originalName: f.originalname,
        storageName,
        mimeType: f.mimetype,
        size: f.size,
        owner: req.user._id,
        compressed
      });
      await Audit.create({ user: req.user._id, file: fileDoc._id, action: 'upload', meta: { originalName: f.originalname }});
      saved.push(fileDoc);
    }
    res.json({ ok: true, files: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  const myFiles = await File.find({ owner: req.user._id }).sort({ createdAt: -1 });
  const sharedFiles = await File.find({ allowedUsers: req.user._id }).sort({ createdAt: -1 });
  res.json({ ownerFiles: myFiles, sharedFiles });
});

router.post('/:fileId/share', auth, async (req, res) => {
  const { userIds = [] } = req.body;
  const file = await File.findById(req.params.fileId);
  if (!file) return res.status(404).json({ message: 'Not found' });
  if (file.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not owner' });

  file.allowedUsers = Array.from(new Set([...(file.allowedUsers || []).map(String), ...userIds]));
  await file.save();
  await Audit.create({ user: req.user._id, file: file._id, action: 'share_with_users', meta: { added: userIds } });
  res.json({ ok: true, file });
});

router.post('/:fileId/link', auth, async (req, res) => {
  const { expiresInSeconds, allowedUsers, restrictedUsers } = req.body; 
  const file = await File.findById(req.params.fileId);
  if (!file) return res.status(404).json({ message: 'Not found' });
  if (file.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not owner' });

  const token = uuidv4();
  const link = new ShareLink({
    file: file._id,
    token,
    createdBy: req.user._id,
    expiresAt: expiresInSeconds ? new Date(Date.now() + expiresInSeconds * 1000) : null,
    allowedUsers: allowedUsers || [],
    restrictedUsers: restrictedUsers || []
  });
  await link.save();
  await Audit.create({ user: req.user._id, file: file._id, action: 'create_link', meta: { token, expiresAt: link.expiresAt, restrictedUsers: restrictedUsers || [] } });
  res.json({ url: `/api/files/link/${token}`, token, expiresAt: link.expiresAt });
});

router.get('/link/:token', auth, async (req, res) => {
  const link = await ShareLink.findOne({ token: req.params.token }).populate('file');
  if (!link) return res.status(404).json({ message: 'Invalid link' });
  if (link.expiresAt && link.expiresAt < new Date()) return res.status(410).json({ message: 'Link expired' });

  const userId = req.user._id.toString();

  if (link.restrictedUsers && link.restrictedUsers.includes(userId)) {
    return res.status(403).json({ message: 'You are restricted from accessing this link' });
  }

  if (link.allowedUsers && link.allowedUsers.length > 0 && !link.allowedUsers.includes(userId)) {
    return res.status(403).json({ message: 'Not allowed' });
  }

  const file = await File.findById(link.file._id);
  const allowed = file.owner.toString() === userId || (file.allowedUsers || []).some(u => u.toString() === userId);
  if (!allowed && (!link.allowedUsers || link.allowedUsers.length === 0)) {
  }

  res.json({ file: { id: file._id, name: file.originalName, mimeType: file.mimeType, size: file.size } });
});

router.get('/:fileId/download', auth, async (req, res) => {
  const file = await File.findById(req.params.fileId);
  if (!file) return res.status(404).json({ message: 'Not found' });

  const userId = req.user._id.toString();
  const isOwner = file.owner.toString() === userId;
  const isAllowedUser = (file.allowedUsers || []).some(u => u.toString() === userId);

  const linkToken = req.query.token;
  let linkValid = false;
  if (linkToken) {
    const link = await ShareLink.findOne({ token: linkToken, file: file._id });
    if (link && (!link.expiresAt || link.expiresAt > new Date())) {
      if (!link.allowedUsers?.length || link.allowedUsers.includes(userId)) {
        if (!link.restrictedUsers?.length || !link.restrictedUsers.includes(userId)) {
          linkValid = true;
        }
      }
    }
  }

  if (!isOwner && !isAllowedUser && !linkValid) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const storagePath = path.join(UPLOAD_DIR, file.storageName);
  if (!fs.existsSync(storagePath)) return res.status(404).json({ message: 'File missing' });

  if (file.compressed && file.storageName.endsWith('.gz')) {
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    const read = fs.createReadStream(storagePath);
    const gunzip = zlib.createGunzip();
    read.pipe(gunzip).pipe(res);
  } else {
    res.download(storagePath, file.originalName);
  }

  await Audit.create({ user: req.user._id, file: file._id, action: 'download' });
});

router.post('/:fileId/unshare', auth, async (req, res) => {
  const { userIds = [] } = req.body;
  const file = await File.findById(req.params.fileId);
  if (!file) return res.status(404).json({ message: 'Not found' });
  if (file.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not owner' });

  file.allowedUsers = (file.allowedUsers || []).filter(u => !userIds.includes(u.toString()));
  await file.save();
  await Audit.create({ user: req.user._id, file: file._id, action: 'unshare', meta: { removed: userIds } });
  res.json({ ok: true });
});

router.get('/:fileId/audit', auth, async (req, res) => {
  const file = await File.findById(req.params.fileId);
  if (!file) return res.status(404).json({ message: 'Not found' });
  if (file.owner.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not owner' });

  const logs = await Audit.find({ file: file._id }).sort({ createdAt: -1 }).limit(200).populate('user', 'name email');
  res.json(logs);
});

router.delete('/:fileId', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });
    if (file.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const storagePath = path.join(UPLOAD_DIR, file.storageName);
    if (fs.existsSync(storagePath)) fs.unlinkSync(storagePath);

    await File.deleteOne({ _id: file._id });
    await Audit.create({ user: req.user._id, file: file._id, action: 'delete' });

    res.json({ ok: true, message: 'File deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
