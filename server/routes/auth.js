const express = require("express");
const router = express.Router();
const User = require("@/models/user");
const { generateToken, verifyToken } = require("@/middleware/auth");

const findUserByEmail = (email) => {
  return User.findOne({
    email: { $regex: `^${email}$`, $options: "i" },
  });
};

router.post("/register", async (req, res) => {
  const { name, email, password, role, permissions } = req.body;
  if (!name || !email || !password)
    return res
      .status(400)
      .json({ message: "name, email and password required" });

  try {
    const exists = await findUserByEmail(email);
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const user = new User({ name, email, password, role, permissions });
    const pin = user.setSecurityPin(15, 7);
    await user.save();

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
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
    res.status(500).json({ message: "Internal error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Input Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 2. Find User (Explicitly select password if your schema hides it by default)
    // const user = await User.findOne({ email }).select('+password'); 
    const user = await findUserByEmail(email);

    // 3. Check User Existence FIRST
    if (!user) {
      // Security: Generic message to prevent username enumeration
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. Banned Check (Check only after user exists)
    if (user.banned) {
      return res.status(403).json({
        message: "Your account has been banned. Contact support.",
        banned: true,
      });
    }

    // 5. Password Comparison
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 6. Token Generation
    const token = generateToken(user);

    // 7. Cookie Configuration
    const cookieOptions = {
      httpOnly: true, // Prevents XSS attacks
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // CSRF protection
      maxAge: Number(process.env.JWT_COOKIE_EXPIRES_MS) || 2 * 60 * 60 * 1000, // Default 2 hours
    };

    res.cookie("token", token, cookieOptions);

    // 8. Send Response (Sanitized)
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        // Kabhi bhi password ya hash return na karein
      },
    });

  } catch (error) {
    // Console log for Developer (Debugging)
    console.error("Login Error:", error);
    
    // Generic message for User
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

router.post("/reset-password", async (req, res) => {
  const { email, securityPin, newPassword } = req.body;
  if (!email || !securityPin || !newPassword)
    return res
      .status(400)
      .json({ message: "email, securityPin and newPassword required" });

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.securityPin || !user.securityPinExpires)
      return res.status(400).json({ message: "No security pin set" });

    if (user.securityPin !== securityPin)
      return res.status(400).json({ message: "Invalid security pin" });

    if (new Date() > new Date(user.securityPinExpires))
      return res.status(400).json({ message: "Security pin expired" });

    user.password = newPassword;
    user.clearSecurityPin();
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch {
    res.status(500).json({ message: "Internal error" });
  }
});

router.post("/request-reset", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "email required" });

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const pin = user.setSecurityPin(15, 1);
    await user.save();

    res.json({ message: "Security pin generated", securityPin: pin });
  } catch {
    res.status(500).json({ message: "Internal error" });
  }
});

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch {
    res.status(500).json({ message: "Internal error" });
  }
});

module.exports = router;
