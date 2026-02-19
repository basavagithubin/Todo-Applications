const { validationResult } = require('express-validator');
const User = require('../models/User');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/tokens');
const bcrypt = require('bcryptjs');

const sendTokens = (res, user) => {
  const accessToken = signAccessToken({ id: user._id, role: user.role, tv: user.tokenVersion });
  const refreshToken = signRefreshToken({ id: user._id, tv: user.tokenVersion });
  res.cookie('jid', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  return accessToken;
};

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already in use' });
  const user = await User.create({ name, email, password });
  const accessToken = sendTokens(res, user);
  res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken
  });
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  if (user.isBlocked) return res.status(403).json({ message: 'Account blocked' });
  const ok = await user.matchPassword(password);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
  const accessToken = sendTokens(res, user);
  res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken
  });
};

const logout = async (req, res) => {
  const jid = req.cookies.jid;
  if (jid) {
    try {
      const { id } = verifyRefreshToken(jid);
      await User.findByIdAndUpdate(id, { $inc: { tokenVersion: 1 } });
    } catch (e) {}
  }
  res.clearCookie('jid', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api/auth/refresh'
  });
  res.json({ success: true });
};

const profile = async (req, res) => {
  const user = await User.findById(req.user.id).select('_id name email role isBlocked createdAt updatedAt');
  res.json({ user });
};

const refresh = async (req, res) => {
  const token = req.cookies.jid;
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    if (user.tokenVersion !== decoded.tv) return res.status(401).json({ message: 'Invalid token' });
    if (user.isBlocked) return res.status(403).json({ message: 'Account blocked' });
    const accessToken = signAccessToken({ id: user._id, role: user.role, tv: user.tokenVersion });
    res.json({ accessToken });
  } catch (e) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { register, login, logout, profile, refresh };
