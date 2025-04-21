/**
 * Product API routes
 */
const express = require("express");
const router = express.Router();
const productController = require("../../controllers/productController");

// Create a new product
router.post("/", async (req, res) => {
    await productController.createProduct(req, res);
});

// Get all products
router.get("/", async (req, res) => {
    await productController.getAllProducts(req, res);
});

// Get products by category
router.get("/category/:categoryId", async (req, res) => {
    await productController.getProductsByCategory(req, res);
});

// Get products with allergens
router.get("/with-allergens", async (req, res) => {
    await productController.getProductsWithAllergens(req, res);
});

// Delete a product
router.delete("/:id", async (req, res) => {
    await productController.deleteProduct(req, res);
});

// Update a product
router.put("/:id", async (req, res) => {
    await productController.updateProduct(req, res);
});

module.exports = router;
