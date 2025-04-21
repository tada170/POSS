/**
 * Category controller - handles business logic for category operations
 */
const Category = require("../models/Category");
const { validateRequired, validateNumeric } = require("../utils/validationUtils");
const { error, info } = require("../utils/logUtils");
const { validateAndExecute } = require("../utils/controllerUtils");

/**
 * Create a new category
 */
async function createCategory(req, res) {
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

            info("Creating new category", { Nazev });

            const categoryId = await Category.create({
                Nazev
            });

            info("Category created successfully", { categoryId });
            return categoryId;
        },
        errorMessage: "Error creating category",
        successStatus: 201,
        successResponse: "Category added successfully"
    });
}

/**
 * Get all categories
 */
async function getAllCategories(req, res) {
    await validateAndExecute(req, res, {
        executionFn: async () => {
            info("Getting all categories");
            return await Category.getAll();
        },
        errorMessage: "Error retrieving categories"
    });
}

/**
 * Get category by ID
 */
async function getCategoryById(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const categoryId = req.params.id;
            return validateNumeric(categoryId, { isInteger: true, min: 1 });
        },
        executionFn: async (req) => {
            const categoryId = parseInt(req.params.id, 10);
            info("Getting category by ID", { categoryId });
            return await Category.getById(categoryId);
        },
        errorMessage: "Error retrieving category"
    });
}

/**
 * Update a category
 */
async function updateCategory(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const categoryId = req.params.id;
            const { Nazev } = req.body;

            // Validate category ID
            const idValidation = validateNumeric(categoryId, { isInteger: true, min: 1 });
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
            const categoryId = parseInt(req.params.id, 10);
            const { Nazev } = req.body;

            info("Updating category", { categoryId, Nazev });

            await Category.update(categoryId, {
                Nazev
            });

            info("Category updated successfully", { categoryId });
            return null;
        },
        errorMessage: "Error updating category",
        successStatus: 200,
        successResponse: "Category updated successfully"
    });
}

/**
 * Delete a category
 */
async function deleteCategory(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const categoryId = req.params.id;
            return validateNumeric(categoryId, { isInteger: true, min: 1 });
        },
        executionFn: async (req) => {
            const categoryId = parseInt(req.params.id, 10);
            info("Deleting category", { categoryId });
            await Category.remove(categoryId);
            info("Category deleted successfully", { categoryId });
            return null; // No content to return
        },
        errorMessage: "Error deleting category",
        successStatus: 204 // No content
    });
}

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};
