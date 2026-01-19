import jwt from "jsonwebtoken";
import User from "../models/user.mjs";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const TOKEN_EXP = process.env.JWT_EXPIRES_IN || "2h";

const generateToken = (user) => {
  const payload = {
    id: user._id,
    role: user.role,
    permissions: user.permissions || [],
    email: user.email,
    name: user.name,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXP });
};

const verifyToken = async (req, res, next) => {
  let auth = req.headers.authorization || req.headers.Authorization;
  let token;

  if (auth && auth.startsWith("Bearer ")) {
    token = auth.split(" ")[1];
  }

  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const authorizeRoles = (...allowed) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (allowed.includes(req.user.role)) {
      return next();
    }

    return res
      .status(403)
      .json({ message: "Forbidden: insufficient role" });
  };
};

const authorizePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role === "super_admin") {
      return next();
    }

    const perms = req.user.permissions || [];
    if (perms.includes(permission)) {
      return next();
    }

    return res
      .status(403)
      .json({ message: "Forbidden: missing permission" });
  };
};

export {
  generateToken,
  verifyToken,
  authorizeRoles,
  authorizePermission,
};
