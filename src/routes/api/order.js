/**
 * Order API routes
 */
const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/orderController");

// Create a new order
router.post("/", async (req, res) => {
    await orderController.createOrder(req, res);
});

// Get all orders
router.get("/", async (req, res) => {
    await orderController.getAllOrders(req, res);
});

// Get orders by user ID
router.get("/user/:userId", async (req, res) => {
    await orderController.getOrdersByUserId(req, res);
});

// Get order by ID
router.get("/:id", async (req, res) => {
    await orderController.getOrderById(req, res);
});

// Get remaining items for an order
router.get("/:id/remaining", async (req, res) => {
    await orderController.getRemainingItems(req, res);
});

// Add items to an order
router.post("/:id/items", async (req, res) => {
    await orderController.addOrderItems(req, res);
});

// Update order payment status
router.patch("/:id/payment", async (req, res) => {
    await orderController.updatePaymentStatus(req, res);
});

// Delete an order
router.delete("/:id", async (req, res) => {
    await orderController.deleteOrder(req, res);
});

module.exports = router;
