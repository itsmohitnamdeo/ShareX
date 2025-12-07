const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const users = await User.find({}, 'name email');
  res.json(users.filter(u => u._id.toString() !== req.user._id.toString()));
});

module.exports = router;
