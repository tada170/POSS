/**
 * Role API routes
 */
const express = require("express");
const router = express.Router();
const roleController = require("../../controllers/roleController");

// Create a new role
router.post("/", async (req, res) => {
    await roleController.createRole(req, res);
});

// Get all roles
router.get("/", async (req, res) => {
    await roleController.getAllRoles(req, res);
});

// Get role by ID
router.get("/:id", async (req, res) => {
    await roleController.getRoleById(req, res);
});

// Update a role
router.put("/:id", async (req, res) => {
    await roleController.updateRole(req, res);
});

// Delete a role
router.delete("/:id", async (req, res) => {
    await roleController.deleteRole(req, res);
});

module.exports = router;