/**
 * Role controller - handles business logic for role operations
 */
const Role = require("../models/Role");
const { validateRequired, validateNumeric } = require("../utils/validationUtils");
const { error, info } = require("../utils/logUtils");
const { validateAndExecute } = require("../utils/controllerUtils");

/**
 * Create a new role
 */
async function createRole(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const { Nazev } = req.body;

            // Validate required fields
            const fieldsValidation = validateRequired(
                { Nazev },
                ['Nazev']
            );

            if (!fieldsValidation.isValid) {
                return fieldsValidation;
            }

            return { isValid: true };
        },
        executionFn: async (req) => {
            const { Nazev } = req.body;

            info("Creating new role", { Nazev });

            const roleId = await Role.create({
                Nazev
            });

            info("Role created successfully", { roleId });
            return roleId;
        },
        errorMessage: "Error creating role",
        successStatus: 201,
        successResponse: "Role added successfully"
    });
}

/**
 * Get all roles
 */
async function getAllRoles(req, res) {
    await validateAndExecute(req, res, {
        executionFn: async () => {
            info("Getting all roles");
            return await Role.getAll();
        },
        errorMessage: "Error retrieving roles"
    });
}

/**
 * Get role by ID
 */
async function getRoleById(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const roleId = req.params.id;
            return validateNumeric(roleId, { isInteger: true, min: 1 });
        },
        executionFn: async (req) => {
            const roleId = req.params.id;
            info("Getting role by ID", { roleId });
            return await Role.getById(roleId);
        },
        errorMessage: "Error retrieving role"
    });
}

/**
 * Update a role
 */
async function updateRole(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const roleId = req.params.id;
            const { Nazev } = req.body;

            // Validate role ID
            const idValidation = validateNumeric(roleId, { isInteger: true, min: 1 });
            if (!idValidation.isValid) {
                return idValidation;
            }

            // Validate required fields
            const fieldsValidation = validateRequired(
                { Nazev },
                ['Nazev']
            );

            if (!fieldsValidation.isValid) {
                return fieldsValidation;
            }

            return { isValid: true };
        },
        executionFn: async (req) => {
            const roleId = req.params.id;
            const { Nazev } = req.body;

            info("Updating role", { roleId, Nazev });

            await Role.update(roleId, {
                Nazev
            });

            info("Role updated successfully", { roleId });
            return null;
        },
        errorMessage: "Error updating role",
        successStatus: 200,
        successResponse: "Role updated successfully"
    });
}

/**
 * Delete a role
 */
async function deleteRole(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const roleId = req.params.id;
            return validateNumeric(roleId, { isInteger: true, min: 1 });
        },
        executionFn: async (req) => {
            const roleId = req.params.id;
            info("Deleting role", { roleId });
            await Role.remove(roleId);
            info("Role deleted successfully", { roleId });
            return null; // No content to return
        },
        errorMessage: "Error deleting role",
        successStatus: 204 // No content
    });
}

module.exports = {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole
};