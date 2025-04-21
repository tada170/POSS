/**
 * HTML page routes
 */
const path = require("path");
const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../../middleware/auth");

// Define HTML routes
router.get("/product-add", isAuthenticated, (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "html", "product_add.html"));
});

router.get("/user-add", isAuthenticated, (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "html", "user_add.html"));
});

router.get("/product-list", isAuthenticated, (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "html", "product_list.html"));
});

router.get("/", isAuthenticated, (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "html", "index.html"));
});

router.get("/login", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "html", "login.html"));
});

router.get("/category-add", isAuthenticated, (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "html", "category_add.html"));
});

router.get("/category-list", isAuthenticated, (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "html", "category_list.html"));
});

router.get("/user-list", isAuthenticated, (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "html", "user_list.html"));
});

router.get("/order-add", isAuthenticated, (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "html", "order_add.html"));
});

module.exports = router;