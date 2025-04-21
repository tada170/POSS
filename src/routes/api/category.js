/**
 * Category API routes
 */
const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/categoryController");

// Create a new category
router.post("/", async (req, res) => {
    await categoryController.createCategory(req, res);
});

// Get all categories
router.get("/", async (req, res) => {
    await categoryController.getAllCategories(req, res);
});

// Get category by ID
router.get("/:id", async (req, res) => {
    await categoryController.getCategoryById(req, res);
});

// Update a category
router.put("/:id", async (req, res) => {
    await categoryController.updateCategory(req, res);
});

// Delete a category
router.delete("/:id", async (req, res) => {
    await categoryController.deleteCategory(req, res);
});

module.exports = router;