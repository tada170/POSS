/**
 * Allergen controller - handles business logic for allergen operations
 */
const Allergen = require("../models/Allergen");
const { validateRequired, validateNumeric } = require("../utils/validationUtils");
const { error, info } = require("../utils/logUtils");
const { validateAndExecute } = require("../utils/controllerUtils");

/**
 * Create a new allergen
 */
async function createAllergen(req, res) {
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

            info("Creating new allergen", { Nazev });

            const allergenId = await Allergen.create({
                Nazev
            });

            info("Allergen created successfully", { allergenId });
            return allergenId;
        },
        errorMessage: "Error creating allergen",
        successStatus: 201,
        successResponse: "Allergen added successfully"
    });
}

/**
 * Get all allergens
 */
async function getAllAllergens(req, res) {
    await validateAndExecute(req, res, {
        executionFn: async () => {
            info("Getting all allergens");
            return await Allergen.getAll();
        },
        errorMessage: "Error retrieving allergens"
    });
}

/**
 * Get allergen by ID
 */
async function getAllergenById(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const allergenId = req.params.id;
            return validateNumeric(allergenId, { isInteger: true, min: 1 });
        },
        executionFn: async (req) => {
            const allergenId = req.params.id;
            info("Getting allergen by ID", { allergenId });
            return await Allergen.getById(allergenId);
        },
        errorMessage: "Error retrieving allergen"
    });
}

/**
 * Update an allergen
 */
async function updateAllergen(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const allergenId = req.params.id;
            const { Nazev } = req.body;

            // Validate allergen ID
            const idValidation = validateNumeric(allergenId, { isInteger: true, min: 1 });
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
            const allergenId = req.params.id;
            const { Nazev } = req.body;

            info("Updating allergen", { allergenId, Nazev });

            await Allergen.update(allergenId, {
                Nazev
            });

            info("Allergen updated successfully", { allergenId });
            return null;
        },
        errorMessage: "Error updating allergen",
        successStatus: 200,
        successResponse: "Allergen updated successfully"
    });
}

/**
 * Delete an allergen
 */
async function deleteAllergen(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const allergenId = req.params.id;
            return validateNumeric(allergenId, { isInteger: true, min: 1 });
        },
        executionFn: async (req) => {
            const allergenId = req.params.id;
            info("Deleting allergen", { allergenId });
            await Allergen.remove(allergenId);
            info("Allergen deleted successfully", { allergenId });
            return null; // No content to return
        },
        errorMessage: "Error deleting allergen",
        successStatus: 204 // No content
    });
}

/**
 * Get allergens for a product
 */
async function getAllergensByProductId(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const productId = req.params.productId;
            return validateNumeric(productId, { isInteger: true, min: 1 });
        },
        executionFn: async (req) => {
            const productId = req.params.productId;
            info("Getting allergens for product", { productId });
            return await Allergen.getByProductId(productId);
        },
        errorMessage: "Error retrieving allergens for product"
    });
}

module.exports = {
    createAllergen,
    getAllAllergens,
    getAllergenById,
    updateAllergen,
    deleteAllergen,
    getAllergensByProductId
};