// server/routes/notes.js
const express = require("express");
const Note = require("../models/Note");
const { authenticateToken } = require("../middleware/auth");
const { body, validationResult, param, query } = require("express-validator");

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation rules
const noteValidation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters"),
  body("content")
    .trim()
    .isLength({ min: 1, max: 50000 })
    .withMessage("Content must be between 1 and 50,000 characters"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((tags) => {
      if (tags && tags.length > 10) {
        throw new Error("Maximum 10 tags allowed");
      }
      return true;
    }),
  body("category")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Category cannot exceed 50 characters"),
  body("color")
    .optional()
    .isIn([
      "default",
      "red",
      "orange",
      "yellow",
      "green",
      "blue",
      "purple",
      "pink",
    ])
    .withMessage("Invalid color value"),
];

const idValidation = [param("id").isMongoId().withMessage("Invalid note ID")];

// Get all notes for authenticated user
router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("category")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Category too long"),
    query("search")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Search term too long"),
    query("sortBy")
      .optional()
      .isIn(["created", "updated", "title"])
      .withMessage("Invalid sort option"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        page = 1,
        limit = 20,
        category,
        search,
        sortBy = "created",
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        category,
        search,
        sortBy,
      };

      const notes = await Note.findByUser(req.user.userId, options);
      const totalNotes = await Note.getUserNoteCount(req.user.userId);
      const totalPages = Math.ceil(totalNotes / limit);

      res.json({
        success: true,
        data: {
          notes: notes.map((note) => note.toApiResponse()),
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalNotes,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Get notes error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch notes",
      });
    }
  }
);

// Get single note by ID
router.get("/:id", idValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID",
        errors: errors.array(),
      });
    }

    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.json({
      success: true,
      data: {
        note: note.toApiResponse(),
      },
    });
  } catch (error) {
    console.error("Get note error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch note",
    });
  }
});

// Create new note
router.post("/", noteValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      title,
      content,
      tags = [],
      category = "general",
      color = "default",
      isPinned = false,
    } = req.body;

    const note = new Note({
      userId: req.user.userId,
      title,
      content,
      tags,
      category,
      color,
      isPinned,
    });

    await note.save();

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: {
        note: note.toApiResponse(),
      },
    });
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create note",
    });
  }
});

// Update note
router.put("/:id", [...idValidation, ...noteValidation], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { title, content, tags, category, color, isPinned } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        title,
        content,
        tags,
        category,
        color,
        isPinned,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.json({
      success: true,
      message: "Note updated successfully",
      data: {
        note: note.toApiResponse(),
      },
    });
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update note",
    });
  }
});

// Toggle pin status
router.patch("/:id/pin", idValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID",
        errors: errors.array(),
      });
    }

    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.json({
      success: true,
      message: `Note ${note.isPinned ? "pinned" : "unpinned"} successfully`,
      data: {
        note: note.toApiResponse(),
      },
    });
  } catch (error) {
    console.error("Toggle pin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle pin status",
    });
  }
});

// Delete note
router.delete("/:id", idValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID",
        errors: errors.array(),
      });
    }

    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.json({
      success: true,
      message: "Note deleted successfully",
      data: {
        deletedNote: {
          id: note._id,
          title: note.title,
        },
      },
    });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete note",
    });
  }
});

// Bulk delete notes
router.delete(
  "/",
  [
    body("noteIds")
      .isArray({ min: 1 })
      .withMessage("noteIds must be a non-empty array")
      .custom((noteIds) => {
        if (noteIds.some((id) => !id.match(/^[0-9a-fA-F]{24}$/))) {
          throw new Error("All note IDs must be valid MongoDB ObjectIds");
        }
        return true;
      }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { noteIds } = req.body;

      const deleteResult = await Note.deleteMany({
        _id: { $in: noteIds },
        userId: req.user.userId,
      });

      res.json({
        success: true,
        message: `${deleteResult.deletedCount} notes deleted successfully`,
        data: {
          deletedCount: deleteResult.deletedCount,
        },
      });
    } catch (error) {
      console.error("Bulk delete error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete notes",
      });
    }
  }
);

// Get note statistics
router.get("/stats/summary", async (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = await Note.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalNotes: { $sum: 1 },
          pinnedNotes: { $sum: { $cond: ["$isPinned", 1, 0] } },
          categories: { $addToSet: "$category" },
          averageContentLength: { $avg: { $strLenCP: "$content" } },
        },
      },
    ]);

    const categoryStats = await Note.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalNotes: 0,
          pinnedNotes: 0,
          categories: [],
          averageContentLength: 0,
        },
        categoryBreakdown: categoryStats,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
    });
  }
});

module.exports = router;
