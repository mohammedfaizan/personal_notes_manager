// server/models/Note.js
const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
      minlength: [1, "Title must be at least 1 character long"],
    },
    content: {
      type: String,
      required: [true, "Note content is required"],
      trim: true,
      maxlength: [50000, "Content cannot exceed 50,000 characters"],
      minlength: [1, "Content must be at least 1 character long"],
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [30, "Tag cannot exceed 30 characters"],
      },
    ],
    category: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [50, "Category cannot exceed 50 characters"],
      default: "general",
    },
    isPrivate: {
      type: Boolean,
      default: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      enum: [
        "default",
        "red",
        "orange",
        "yellow",
        "green",
        "blue",
        "purple",
        "pink",
      ],
      default: "default",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for user-specific queries
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, isPinned: -1, createdAt: -1 });
noteSchema.index({ userId: 1, category: 1 });

// Text index for search functionality
noteSchema.index({
  title: "text",
  content: "text",
  tags: "text",
});

// Instance method to format note for API response
noteSchema.methods.toApiResponse = function () {
  return {
    id: this._id,
    title: this.title,
    content: this.content,
    tags: this.tags,
    category: this.category,
    isPrivate: this.isPrivate,
    isPinned: this.isPinned,
    color: this.color,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Static method to find notes by user
noteSchema.statics.findByUser = function (userId, options = {}) {
  const query = { userId };

  // Add category filter if specified
  if (options.category) {
    query.category = options.category;
  }

  // Add search functionality
  if (options.search) {
    query.$text = { $search: options.search };
  }

  let noteQuery = this.find(query);

  // Sorting: pinned notes first, then by creation date
  const sortOptions = {};
  if (options.sortBy === "title") {
    sortOptions.title = 1;
  } else if (options.sortBy === "updated") {
    sortOptions.updatedAt = -1;
  } else {
    sortOptions.isPinned = -1;
    sortOptions.createdAt = -1;
  }

  noteQuery = noteQuery.sort(sortOptions);

  // Pagination
  if (options.page && options.limit) {
    const skip = (options.page - 1) * options.limit;
    noteQuery = noteQuery.skip(skip).limit(options.limit);
  }

  return noteQuery;
};

// Static method to get user's note count
noteSchema.statics.getUserNoteCount = function (userId) {
  return this.countDocuments({ userId });
};

// Pre-save middleware for validation
noteSchema.pre("save", function (next) {
  // Ensure tags are unique and clean
  if (this.tags && this.tags.length > 0) {
    this.tags = [...new Set(this.tags.filter((tag) => tag.trim() !== ""))];
  }

  // Limit number of tags
  if (this.tags && this.tags.length > 10) {
    this.tags = this.tags.slice(0, 10);
  }

  next();
});

module.exports = mongoose.model("Note", noteSchema);
