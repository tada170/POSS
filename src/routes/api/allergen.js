/**
 * Allergen API routes
 */
const express = require("express");
const router = express.Router();
const allergenController = require("../../controllers/allergenController");

// Create a new allergen
router.post("/", async (req, res) => {
    await allergenController.createAllergen(req, res);
});

// Get all allergens
router.get("/", async (req, res) => {
    await allergenController.getAllAllergens(req, res);
});

// Get allergens for a product
router.get("/product/:productId", async (req, res) => {
    await allergenController.getAllergensByProductId(req, res);
});

// Get allergen by ID
router.get("/:id", async (req, res) => {
    await allergenController.getAllergenById(req, res);
});

// Update an allergen
router.put("/:id", async (req, res) => {
    await allergenController.updateAllergen(req, res);
});

// Delete an allergen
router.delete("/:id", async (req, res) => {
    await allergenController.deleteAllergen(req, res);
});

module.exports = router;
