const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Audit = require('../models/Audit');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email exists' });
    user = new User({ name, email });
    await user.setPassword(password);
    await user.save();
    await Audit.create({ user: user._id, action: 'register', meta: { email } });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email }});
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const ok = await user.validatePassword(password);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  await Audit.create({ user: user._id, action: 'login' });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email }});
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email exists' });
    user = new User({ name, email });
    await user.setPassword(password);
    await user.save();
    await Audit.create({ user: user._id, action: 'register', meta: { email } });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email }});
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const ok = await user.validatePassword(password);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  await Audit.create({ user: user._id, action: 'login' });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email }});
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id, 'name email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

