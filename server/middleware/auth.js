const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const TOKEN_EXP = process.env.JWT_EXPIRES_IN || '2h';

function generateToken(user) {
  const payload = {
    id: user._id,
    role: user.role,
    permissions: user.permissions || [],
    email: user.email,
    name: user.name
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXP });
}

async function verifyToken(req, res, next) {
  // First try Authorization header
  let auth = req.headers.authorization || req.headers.Authorization;
  let token;
  if (auth && auth.startsWith('Bearer ')) {
    token = auth.split(' ')[1];
  }

  // Fallback: try cookie named 'token' (HttpOnly cookie set by server)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach minimal user info to request
    req.user = decoded;
    // Optionally refresh user from DB for critical actions
    // req.currentUser = await User.findById(decoded.id).select('-password');
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function authorizeRoles(...allowed) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (allowed.includes(req.user.role)) return next();
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  };
}

function authorizePermission(permission) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    // super_admin bypasses permissions
    if (req.user.role === 'super_admin') return next();
    const perms = req.user.permissions || [];
    if (perms.includes(permission)) return next();
    return res.status(403).json({ message: 'Forbidden: missing permission' });
  };
}

module.exports = {
  generateToken,
  verifyToken,
  authorizeRoles,
  authorizePermission
};
