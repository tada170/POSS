/**
 * User API routes
 */
const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");

// Create a new user
router.post("/", async (req, res) => {
    await userController.createUser(req, res);
});

// Get all users
router.get("/", async (req, res) => {
    await userController.getAllUsers(req, res);
});

// Authenticate a user
router.post("/login", async (req, res) => {
    await userController.authenticateUser(req, res);
});

// Logout a user
router.post("/logout", async (req, res) => {
    await userController.logoutUser(req, res);
});

// Get user by ID
router.get("/:id", async (req, res) => {
    await userController.getUserById(req, res);
});

// Update a user
router.put("/:id", async (req, res) => {
    await userController.updateUser(req, res);
});

// Delete a user
router.delete("/:id", async (req, res) => {
    await userController.deleteUser(req, res);
});

module.exports = router;
