/**
 * API routes coordinator
 */
const express = require("express");
const router = express.Router();

// Import route modules
const productRoutes = require("./product");
const categoryRoutes = require("./category");
const userRoutes = require("./user");
const orderRoutes = require("./order");
const roleRoutes = require("./role");
const allergenRoutes = require("./allergen");

// Register routes
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/users", userRoutes);
router.use("/orders", orderRoutes);
router.use("/roles", roleRoutes);
router.use("/allergens", allergenRoutes);

module.exports = router;