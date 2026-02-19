const User = require('../models/User');
const { verifyAccessToken } = require('../utils/tokens');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.substring(7) : null;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (user.isBlocked) return res.status(403).json({ message: 'Account blocked' });
    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (e) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };

module.exports = { auth, authorize };
