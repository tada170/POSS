// Order Processing System
// Handles the business logic for order management

// State variables
let currentOrderId = '';
let selectedItems = [];

/**
 * Group orders by transaction ID
 * @param {Array} data - Raw order data from API
 * @returns {Object} - Grouped orders by transaction ID
 */
function groupOrders(data) {
    return data.reduce((acc, item) => {
        console.log(data)
        const transakceID = item.TransakceID;
        console.log
        if (!acc[transakceID]) {
            acc[transakceID] = {
                TransakceID: transakceID,
                Nazev: item.TransakceNazev || "Unknown Order",
                UzivatelJmeno: item.UzivatelJmeno || "Unknown User",
                DatumTransakce: item.DatumTransakce || "Unknown Date",
                Zaplaceno: item.Zaplaceno || false,
                Items: []
            };
        }

        if (item.Items.length > 0) {
            item.Items.forEach(subItem => {
                acc[transakceID].Items.push({
                    ProduktID: subItem.ProduktID,
                    ProduktNazev: subItem.ProduktNazev || "Unnamed Product",
                    Mnozstvi: subItem.Mnozstvi || 0,
                    Cena: subItem.Cena || 0,
                    Zaplaceno: subItem.Zaplaceno || false,
                    Alergeny: subItem.Alergeny || []
                });
            });
        }

        return acc;
    }, {});
}

/**
 * Handle checkbox change for product selection
 * @param {HTMLElement} checkbox - The checkbox element
 * @param {HTMLElement} quantityInput - The quantity input element
 */
function handleCheckboxChange(checkbox, quantityInput) {
    const productId = checkbox.id;
    const price = checkbox.value;
    const quantity = parseInt(quantityInput.value) || 1;

    if (checkbox.checked) {
        const existingItem = selectedItems.find(item => item.productId === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            selectedItems.push({
                productId: productId,
                price: price,
                quantity: quantity
            });
        }
    } else {
        selectedItems = selectedItems.filter(item => item.productId !== productId);
    }
}

/**
 * Handle checkbox change for payment
 * @param {Event} event - The change event
 * @param {Array} checkboxes - Array of checkbox data
 */
function handleCheckboxChangePay(event, checkboxes) {
    const payButton = document.getElementById(`pay-${event.target.closest(".item-list").id}`);
    const checkedItems = checkboxes.filter(checkbox => checkbox.quantityInput.disabled === false && checkbox.quantityInput.value > 0);
    payButton.disabled = checkedItems.length === 0;
}

/**
 * Handle payment for an order
 * @param {number} transactionId - The transaction ID
 * @param {Array} checkboxes - Array of checkbox data
 */
async function handlePayment(transactionId, checkboxes) {
    const paymentData = [];
    let amount = 0;

    const remainingData = await fetchRemainingItems(transactionId);
    let allPaid = true;

    checkboxes.forEach(checkbox => {
        const remainingItem = remainingData.find(item => item.ProduktID === checkbox.itemId);
        let remaining = remainingItem ? remainingItem.Mnozstvi : 0;
        const quantity = parseInt(checkbox.quantityInput.value);

        if (!checkbox.quantityInput.disabled && quantity > 0) {
            paymentData.push({
                ProduktID: checkbox.itemId,
                Mnozstvi: quantity
            });

            amount += quantity * checkbox.itemCost;
            remaining -= quantity;

            checkbox.remainingText.innerHTML = "Remaining to pay: " + remaining;
            checkbox.quantityInput.max = remaining;
            checkbox.quantityInput.value = 0;
        }

        if (remaining > 0) {
            allPaid = false;
        }
    });

    if (allPaid) {
        const transaction = document.querySelector(`[data-transakce-id="${transactionId}"]`);
        transaction.classList.add("paid");
    }

    alert("Total to pay: " + amount + " Czk");

    if (paymentData.length > 0) {
        try {
            // Process payment by setting Zaplaceno to true
            await processPayment(transactionId);
            alert('Payment processed successfully!');
        } catch (error) {
            alert('Failed to process payment.');
        }
    } else {
        alert('Please select items to pay for.');
    }
}

/**
 * Save an order
 */
async function saveOrder() {
    const orderName = document.getElementById("order-name").value;

    const data = await createOrder(orderName);
    console.log(data + "asdasdasdasdas")
    console.log(JSON.stringify(data))
    currentOrderId = data.TransakceID;
    console.log(data.TransakceID)
    openItemModal();
    loadOrders();


}

/**
 * Save order items
 */
async function saveOrderItem() {
    if (selectedItems.length === 0) {
        alert("Please select at least one product.");
        return;
    }

    try {
        console.log(currentOrderId)
        await saveOrderItems(currentOrderId, selectedItems);
        closeItemModal();
        loadOrders();
    } catch (error) {
        alert('Failed to save the order items.');
    }
}

/**
 * Load orders from API and render them
 */
async function loadOrders() {
    try {
        const data = await fetchOrders();
        const groupedOrders = groupOrders(data);
        renderOrders(groupedOrders);
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

/**
 * Load categories from API and render them
 */
async function getCategories() {
    try {
        const categories = await fetchCategories();
        renderCategories(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

/**
 * Load products for a category from API and render them
 * @param {number} categoryId - The category ID
 */
async function getProducts(categoryId) {
    try {
        const products = await fetchProducts(categoryId);
        renderProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", loadOrders);

// Export functions for UI interaction
window.saveOrder = saveOrder;
window.saveOrderItem = saveOrderItem;
window.handleCheckboxChange = handleCheckboxChange;
window.handleCheckboxChangePay = handleCheckboxChangePay;
window.handlePayment = handlePayment;
window.getCategories = getCategories;
window.getProducts = getProducts;
window.currentOrderId = currentOrderId;
