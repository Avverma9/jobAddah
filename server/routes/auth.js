const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { generateToken, verifyToken } = require('../middleware/auth');

const findUserByEmail = (email) => {
  return User.findOne({
    email: { $regex: `^${email}$`, $options: 'i' }
  });
};

router.post('/register', async (req, res) => {
  const { name, email, password, role, permissions } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'name, email and password required' });

  try {
    const exists = await findUserByEmail(email);
    if (exists)
      return res.status(400).json({ message: 'Email already registered' });

    const user = new User({ name, email, password, role, permissions });
    const pin = user.setSecurityPin(15, 7);
    await user.save();

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: parseInt(process.env.JWT_COOKIE_EXPIRES_MS) || 2 * 60 * 60 * 1000,
    });

    res.status(201).json({
      token,
      securityPin: pin,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch {
    res.status(500).json({ message: 'Internal error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'email and password required' });

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: parseInt(process.env.JWT_COOKIE_EXPIRES_MS) || 2 * 60 * 60 * 1000,
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch {
    res.status(500).json({ message: 'Internal error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

router.post('/reset-password', async (req, res) => {
  const { email, securityPin, newPassword } = req.body;
  if (!email || !securityPin || !newPassword)
    return res.status(400).json({ message: 'email, securityPin and newPassword required' });

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.securityPin || !user.securityPinExpires)
      return res.status(400).json({ message: 'No security pin set' });

    if (user.securityPin !== securityPin)
      return res.status(400).json({ message: 'Invalid security pin' });

    if (new Date() > new Date(user.securityPinExpires))
      return res.status(400).json({ message: 'Security pin expired' });

    user.password = newPassword;
    user.clearSecurityPin();
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch {
    res.status(500).json({ message: 'Internal error' });
  }
});

router.post('/request-reset', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'email required' });

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const pin = user.setSecurityPin(15, 1);
    await user.save();

    res.json({ message: 'Security pin generated', securityPin: pin });
  } catch {
    res.status(500).json({ message: 'Internal error' });
  }
});

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Internal error' });
  }
});

module.exports = router;
