const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/User");

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in database
        let existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          // Update user info in case it changed
          existingUser.name = profile.displayName;
          existingUser.email = profile.emails[0].value;
          existingUser.avatar = profile.photos[0].value;
          existingUser.lastLogin = new Date();
          await existingUser.save();

          return done(null, existingUser);
        }

        // Create new user
        const newUser = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
          provider: "google",
          lastLogin: new Date(),
        });

        return done(null, newUser);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, null);
      }
    }
  )
);

// JWT Strategy for API authentication
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || "fallback-jwt-secret",
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.userId).select("-__v");

        if (user) {
          return done(null, user);
        }

        return done(null, false);
      } catch (error) {
        console.error("JWT Strategy error:", error);
        return done(error, false);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select("-__v");
    done(null, user);
  } catch (error) {
    console.error("Deserialize user error:", error);
    done(error, null);
  }
});

module.exports = passport;
