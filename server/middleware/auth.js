const jwt = require("jsonwebtoken");
const User = require("../models/User");

// JWT Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-jwt-secret"
    );

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Invalid token or user no longer exists",
      });
    }

    // Add user info to request
    req.user = {
      userId: user._id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-jwt-secret"
    );
    const user = await User.findById(decoded.userId);

    if (user && user.isActive) {
      req.user = {
        userId: user._id,
        email: user.email,
        name: user.name,
      };
    }
  } catch (error) {
    // Silent fail for optional auth
    console.log("Optional auth failed:", error.message);
  }

  next();
};

// Check if user is admin (for future admin features)
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // In a real app, you'd check user role from database
  // For now, just check if user email is in admin list
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",");

  if (!adminEmails.includes(req.user.email)) {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
};
