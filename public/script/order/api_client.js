// API Client for Order Management
// Handles all API calls for the order management system

/**
 * Fetch all orders from the server
 * @returns {Promise<Array>} - Promise resolving to an array of orders
 */
async function fetchOrders() {
    try {
        const response = await fetch('/api/orders');
        return await response.json();
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}

/**
 * Fetch categories from the server
 * @returns {Promise<Array>} - Promise resolving to an array of categories
 */
async function fetchCategories() {
    try {
        const response = await fetch('/api/categories');
        return await response.json();
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

/**
 * Fetch products for a specific category
 * @param {number} categoryId - The ID of the category
 * @returns {Promise<Array>} - Promise resolving to an array of products
 */
async function fetchProducts(categoryId) {
    try {
        const response = await fetch('/api/products/category/' + categoryId);
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

/**
 * Fetch remaining items to pay for an order
 * @param {number} orderId - The ID of the order
 * @returns {Promise<Array>} - Promise resolving to an array of remaining items
 */
async function fetchRemainingItems(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}/remaining`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching remaining items:', error);
        return [];
    }
}

/**
 * Create a new order
 * @param {string} orderName - The name of the order
 * @returns {Promise<Object>} - Promise resolving to the created order
 */
async function createOrder(orderName) {
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name: orderName})
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating order:', error);
        throw new Error('Failed to create order');
    }
}

/**
 * Save order items
 * @param {number} orderId - The ID of the order
 * @param {Array} items - The items to save
 * @returns {Promise<void>}
 */
async function saveOrderItems(orderId, items) {
    try {
        const response = await fetch(`/api/orders/${orderId}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(items)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        console.error('Error saving order items:', error);
        throw new Error('Failed to save order items');
    }
}


/**
 * Process payment for an order by setting its status to paid
 * @param {number} orderId - The ID of the order
 * @returns {Promise<Object>} - Promise resolving to the payment result
 */
async function processPayment(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}/payment`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({Zaplaceno: true})
        });
        return await response.json();
    } catch (error) {
        console.error('Error processing payment:', error);
        throw new Error('Failed to process payment');
    }
}

// Export API functions
window.fetchOrders = fetchOrders;
window.fetchCategories = fetchCategories;
window.fetchProducts = fetchProducts;
window.fetchRemainingItems = fetchRemainingItems;
window.createOrder = createOrder;
window.saveOrderItems = saveOrderItems;
window.processPayment = processPayment;
