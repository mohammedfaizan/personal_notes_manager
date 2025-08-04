// server/routes/auth.js
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Initiate Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account", // Forces account selection
  })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
    session: false,
  }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: req.user._id,
          email: req.user.email,
        },
        process.env.JWT_SECRET || "fallback-jwt-secret",
        {
          expiresIn: "7d",
          issuer: "notes-app",
          audience: "notes-app-users",
        }
      );

      // Redirect to client with token
      const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?token=${token}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
  }
);

// Get current user profile
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-googleId -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile(),
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
});

// Refresh token
router.post("/refresh", authenticateToken, async (req, res) => {
  try {
    // Generate new token
    const newToken = jwt.sign(
      {
        userId: req.user.userId,
        email: req.user.email,
      },
      process.env.JWT_SECRET || "fallback-jwt-secret",
      {
        expiresIn: "7d",
        issuer: "notes-app",
        audience: "notes-app-users",
      }
    );

    res.json({
      success: true,
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to refresh token",
    });
  }
});

// Logout (client-side token removal)
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    // Update last logout time
    await User.findByIdAndUpdate(req.user.userId, {
      lastLogout: new Date(),
    });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
});

// Delete account
router.delete("/account", authenticateToken, async (req, res) => {
  try {
    // Delete all user's notes first
    const Note = require("../models/Note");
    await Note.deleteMany({ userId: req.user.userId });

    // Delete user account
    await User.findByIdAndDelete(req.user.userId);

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete account",
    });
  }
});

// Validate token endpoint
router.get("/validate", authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      valid: true,
      userId: req.user.userId,
    },
  });
});

module.exports = router;
