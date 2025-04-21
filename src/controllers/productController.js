/**
 * Product controller - handles business logic for product operations
 */
const Product = require("../models/Product");
const { validateRequired, validateNumeric } = require("../utils/validationUtils");
const { error, info } = require("../utils/logUtils");
const { validateAndExecute } = require("../utils/controllerUtils");

/**
 * Create a new product with allergens
 */
async function createProduct(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const { Nazev, Cena, KategID, Alergeny } = req.body;

            // Validate required fields
            const fieldsValidation = validateRequired(
                { Nazev, Cena, KategID, Alergeny },
                ['Nazev', 'Cena', 'KategID', 'Alergeny']
            );

            if (!fieldsValidation.isValid) {
                return fieldsValidation;
            }

            // Validate price
            const priceValidation = validateNumeric(Cena, { min: 0 });
            if (!priceValidation.isValid) {
                return priceValidation;
            }

            return { isValid: true };
        },
        executionFn: async (req) => {
            const { Nazev, Cena, KategID, Alergeny } = req.body;

            info("Creating new product", { Nazev, Cena, KategID });

            const productId = await Product.create({
                Nazev,
                Cena,
                KategID,
                Alergeny
            });

            info("Product created successfully", { productId });
            return productId;
        },
        errorMessage: "Error creating product",
        successStatus: 201,
        successResponse: "Product and allergens added successfully"
    });
}

/**
 * Get all products
 */
async function getAllProducts(req, res) {
    await validateAndExecute(req, res, {
        executionFn: async () => {
            info("Getting all products");
            return await Product.getAll();
        },
        errorMessage: "Error retrieving products"
    });
}

/**
 * Get products by category
 */
async function getProductsByCategory(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const categoryId = req.params.categoryId;
            return validateNumeric(categoryId, { isInteger: true, min: 1 });
        },
        executionFn: async (req) => {
            const categoryId = req.params.categoryId;
            info("Getting products by category", { categoryId });
            const products = await Product.getByCategory(categoryId);

            if (products.length === 0) {
                throw new Error("Not found");
            }

            return products;
        },
        errorMessage: "Error retrieving products by category"
    });
}

/**
 * Get products with allergens
 */
async function getProductsWithAllergens(req, res) {
    await validateAndExecute(req, res, {
        executionFn: async () => {
            info("Getting products with allergens");
            return await Product.getWithAllergens();
        },
        errorMessage: "Error retrieving products with allergens"
    });
}

/**
 * Delete a product
 */
async function deleteProduct(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const productId = req.params.id;
            return validateNumeric(productId, { isInteger: true, min: 1 });
        },
        executionFn: async (req) => {
            const productId = req.params.id;
            info("Deleting product", { productId });
            await Product.remove(productId);
            info("Product deleted successfully", { productId });
            return null; // No content to return
        },
        errorMessage: "Error deleting product",
        successStatus: 204 // No content
    });
}

/**
 * Update a product
 */
async function updateProduct(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const productId = req.params.id;
            const { Nazev, Cena, Alergeny } = req.body;

            // Validate product ID
            const idValidation = validateNumeric(productId, { isInteger: true, min: 1 });
            if (!idValidation.isValid) {
                return idValidation;
            }

            // Validate required fields
            const fieldsValidation = validateRequired(
                { Nazev, Cena, Alergeny },
                ['Nazev', 'Cena', 'Alergeny']
            );

            if (!fieldsValidation.isValid) {
                return fieldsValidation;
            }

            // Validate price
            const priceValidation = validateNumeric(Cena, { min: 0 });
            if (!priceValidation.isValid) {
                return priceValidation;
            }

            return { isValid: true };
        },
        executionFn: async (req) => {
            const productId = req.params.id;
            const { Nazev, Cena, Alergeny } = req.body;

            info("Updating product", { productId, Nazev, Cena });

            await Product.update(productId, {
                Nazev,
                Cena,
                Alergeny
            });

            info("Product updated successfully", { productId });
            return null;
        },
        errorMessage: "Error updating product",
        successStatus: 200,
        successResponse: "Product updated successfully"
    });
}

module.exports = {
    createProduct,
    getAllProducts,
    getProductsByCategory,
    getProductsWithAllergens,
    deleteProduct,
    updateProduct
};
