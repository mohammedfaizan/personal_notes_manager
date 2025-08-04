const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    avatar: {
      type: String,
      default: "",
    },
    provider: {
      type: String,
      default: "google",
      enum: ["google", "facebook", "github"], // For future OAuth providers
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: {
      transform: function (doc, ret) {
        delete ret.googleId; // Don't expose googleId in API responses
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for better query performance
userSchema.index({ email: 1, googleId: 1 });

// Instance method to get public profile
userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin,
  };
};

// Static method to find user by Google ID
userSchema.statics.findByGoogleId = function (googleId) {
  return this.findOne({ googleId });
};

// Pre-save middleware to update lastLogin
userSchema.pre("save", function (next) {
  if (this.isModified("lastLogin") || this.isNew) {
    this.lastLogin = new Date();
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
