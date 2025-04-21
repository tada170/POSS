/**
 * Order controller - handles business logic for order operations
 */
const Order = require("../models/Order");
const { validateRequired, validateNumeric } = require("../utils/validationUtils");
const { error, info } = require("../utils/logUtils");
const { validateAndExecute } = require("../utils/controllerUtils");

/**
 * Create a new order
 */
async function createOrder(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const { name } = req.body;

            // Validate required fields
            const fieldsValidation = validateRequired(
                { name },
                ['name']
            );

            if (!fieldsValidation.isValid) {
                return fieldsValidation;
            }

            return { isValid: true };
        },
        executionFn: async (req) => {
            const { name } = req.body;

            // Get user ID from session
            const UzivatelID = req.session.userId || 1; // Default to user ID 1 if not in session

            info("Creating new order", { name, UzivatelID });

            // Create an empty order with just the name and user ID
            const result = await Order.create({
                UzivatelID,
                Polozky: [], // Empty array of items
                Zaplaceno: false,
                Nazev: name // Add the name to the order
            });

            info("Order created successfully", { TransakceID: result.TransakceID });
            return result.TransakceID;
        },
        errorMessage: "Error creating order",
        successStatus: 201,
        successResponse: "Order added successfully"
    });
}

/**
 * Get all orders
 */
async function getAllOrders(req, res) {
    await validateAndExecute(req, res, {
        executionFn: async () => {
            info("Getting all orders");
            return await Order.getAll();
        },
        errorMessage: "Error retrieving orders"
    });
}

/**
 * Get order by ID
 */
async function getOrderById(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const orderId = req.params.id;
            return validateNumeric(orderId, { isInteger: true, min: 1 });
        },
        executionFn: async (req) => {
            const orderId = req.params.id;
            info("Getting order by ID", { orderId });
            return await Order.getById(orderId);
        },
        errorMessage: "Error retrieving order"
    });
}

/**
 * Update order payment status
 */
async function updatePaymentStatus(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const orderId = req.params.id;
            const { Zaplaceno } = req.body;

            // Validate order ID
            const idValidation = validateNumeric(orderId, { isInteger: true, min: 1 });
            if (!idValidation.isValid) {
                return idValidation;
            }

            // Validate payment status
            if (typeof Zaplaceno !== 'boolean') {
                return {
                    isValid: false,
                    error: "Payment status must be a boolean value"
                };
            }

            return { isValid: true };
        },
        executionFn: async (req) => {
            const orderId = req.params.id;
            const { Zaplaceno } = req.body;

            info("Updating order payment status", { orderId, Zaplaceno });

            await Order.updatePaymentStatus(orderId, Zaplaceno);

            info("Order payment status updated successfully", { orderId, Zaplaceno });
            return null;
        },
        errorMessage: "Error updating order payment status",
        successStatus: 200,
        successResponse: "Order payment status updated successfully"
    });
}

/**
 * Delete an order
 */
async function deleteOrder(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const orderId = req.params.id;
            return validateNumeric(orderId, { isInteger: true, min: 1 });
        },
        executionFn: async (req) => {
            const orderId = req.params.id;
            info("Deleting order", { orderId });
            await Order.remove(orderId);
            info("Order deleted successfully", { orderId });
            return null; // No content to return
        },
        errorMessage: "Error deleting order",
        successStatus: 204 // No content
    });
}

/**
 * Get orders by user ID
 */
async function getOrdersByUserId(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const userId = req.params.userId;
            return validateNumeric(userId, { isInteger: true, min: 1 });
        },
        executionFn: async (req) => {
            const userId = req.params.userId;
            info("Getting orders by user ID", { userId });
            return await Order.getByUserId(userId);
        },
        errorMessage: "Error retrieving orders by user ID"
    });
}

/**
 * Get remaining items to pay for an order
 */
async function getRemainingItems(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const orderId = req.params.id;
            return validateNumeric(orderId, { isInteger: true, min: 1 });
        },
        executionFn: async (req) => {
            const orderId = req.params.id;
            info("Getting remaining items for order", { orderId });
            return await Order.getRemainingItems(orderId);
        },
        errorMessage: "Error retrieving remaining items for order"
    });
}

/**
 * Add items to an existing order
 */
async function addOrderItems(req, res) {
    await validateAndExecute(req, res, {
        validationFn: (req) => {
            const orderId = req.params.id;
            const items = req.body;

            const idValidation = validateNumeric(orderId, { isInteger: true, min: 1 });
            if (!idValidation.isValid) {
                return idValidation;
            }

            if (!Array.isArray(items) || items.length === 0) {
                return {
                    isValid: false,
                    error: "Order must contain at least one item"
                };
            }

            for (const item of items) {
                const { productId, quantity } = item;

                if (!productId) {
                    return {
                        isValid: false,
                        error: "Missing product ID"
                    };
                }

                if (!quantity || quantity <= 0) {
                    return {
                        isValid: false,
                        error: `Invalid quantity for product ${productId}: ${quantity}`
                    };
                }
            }

            return { isValid: true };
        },
        executionFn: async (req) => {
            const orderId = req.params.id;
            const originalItems = req.body;

            // Rozmnožení položek podle quantity
            const expandedItems = [];
            for (const item of originalItems) {
                const { productId, price, quantity } = item;
                for (let i = 0; i < quantity-1; i++) {
                    expandedItems.push({
                        productId,
                        price,
                        quantity: 1
                    });
                }
            }

            info("Adding items to order", { orderId, originalCount: originalItems.length, expandedCount: expandedItems.length });
            console.log(expandedItems)
            await Order.addItems(orderId, expandedItems);

            info("Items added to order successfully", { orderId });
            return null;
        },
        errorMessage: "Error adding items to order",
        successStatus: 201,
        successResponse: "Items added to order successfully"
    });
}


module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updatePaymentStatus,
    deleteOrder,
    getOrdersByUserId,
    getRemainingItems,
    addOrderItems
};
