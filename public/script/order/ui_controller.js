// UI Controller for Order Management
// Handles all UI-related functions for the order management system

// DOM Elements
const categoryList = document.getElementById("category-list-container");
const productList = document.getElementById("product-list-container");

// UI Functions
/**
 * Navigate back to category view from product view
 */
function goBack() {
    categoryList.style.display = 'flex';
    productList.style.display = 'none';
}

/**
 * Open the order creation modal
 */
function openModal() {
    document.getElementById('order-modal').style.display = 'block';
}

/**
 * Close the order creation modal
 */
function closeModal() {
    document.getElementById("order-modal").style.display = "none";
}

/**
 * Open the item addition modal
 */
function openItemModal() {
    document.getElementById('add-item-modal').style.display = 'block';
    categoryList.style.display = 'flex';
    productList.style.display = 'none';
    getCategories();
    selectedItems = [];
}

/**
 * Close the item addition modal
 */
function closeItemModal() {
    document.getElementById('add-item-modal').style.display = "none";
}

/**
 * Handle window clicks to close modals when clicking outside
 */
window.onclick = function (event) {
    if (event.target === document.getElementById("order-modal")) {
        closeModal();
    }
    if (event.target === document.getElementById("add-item-modal")) {
        closeItemModal();
    }
};

/**
 * Render a list of orders
 * @param {Array} orders - The orders to render
 */
async function renderOrders(orders) {
    const orderList = document.getElementById("order-list-container");
    orderList.innerHTML = '';
    console.log(orders)
    for (const order of Object.values(orders)) {
        const orderItem = document.createElement("div");
        orderItem.className = "order-item";
        console.log(order.Zaplaceno)
        if (order.Zaplaceno) {
            orderItem.classList.add("paid");
        }
        orderItem.dataset.transakceId = order.TransakceID;

        const titleContainer = document.createElement("div");
        titleContainer.className = "title-container";

        const orderTitle = document.createElement("span");
        orderTitle.textContent = `Order: ${order.Nazev} (${order.DatumTransakce})`;

        const dropDown = document.createElement("span");
        dropDown.className = "drop-down-btn";
        dropDown.textContent = '▼';

        titleContainer.appendChild(orderTitle);
        titleContainer.appendChild(dropDown);
        orderItem.appendChild(titleContainer);

        const itemList = await renderOrderItems(order);
        dropDown.onclick = () => {
            itemList.style.display = itemList.style.display === "none" ? "block" : "none";
        };

        orderItem.appendChild(itemList);
        orderList.appendChild(orderItem);
    }
}

/**
 * Render the items for a specific order
 * @param {Object} order - The order whose items to render
 * @returns {HTMLElement} - The rendered item list
 */
async function renderOrderItems(order) {
    const itemList = document.createElement("div");
    itemList.className = "item-list";
    itemList.style.display = "none";
    itemList.id = order.TransakceID;

    if (!order.Items || order.Items.length === 0) {
        const noItemsMessage = document.createElement("p");
        noItemsMessage.textContent = "This order has no items.";
        itemList.appendChild(noItemsMessage);
    }

    const productMap = new Map();
    order.Items.forEach(item => {
        if (productMap.has(item.ProduktNazev)) {
            productMap.set(item.ProduktNazev, productMap.get(item.ProduktNazev) + item.Mnozstvi);
        } else {
            productMap.set(item.ProduktNazev, item.Mnozstvi);
        }
    });

    let remainingMap = new Map();
    try {
        const response = await fetch(`/api/orders/${order.TransakceID}/remaining`);
        const data = await response.json();
        data.forEach(item => {
            remainingMap.set(item.ProduktID, item.Mnozstvi);
        });
    } catch (error) {
        console.error("Error loading remaining items:", error);
    }

    const checkboxes = [];

    productMap.forEach((quantity, productName) => {
        const item = order.Items.find(i => i.ProduktNazev === productName);
        const itemDetail = document.createElement("p");
        const allergens = item.Alergeny.length > 0 ? item.Alergeny.join(", ") : "None";
        itemDetail.textContent = `${productName}: ${quantity}x ${item.Cena.toFixed(2)} Czk (Allergens: ${allergens})`;

        const itemDiv = document.createElement("div");
        itemDiv.id = `item-${item.ProduktID}-${itemList.id}`;

        const checkBox = document.createElement('input');
        checkBox.type = "checkbox";
        checkBox.id = item.ProduktID + '-' + itemList.id;

        const remaining = remainingMap.get(item.ProduktID) ?? 0;

        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.value = 0;
        quantityInput.min = 0;
        quantityInput.max = remaining;
        quantityInput.disabled = true;
        quantityInput.id = `quantity-${item.ProduktID}-${itemList.id}`;

        const remainingText = document.createElement('span');
        remainingText.id = `remaining-${item.ProduktID}-${itemList.id}`;
        remainingText.textContent = `Remaining to pay: ${remaining}`;

        checkBox.onchange = () => {
            quantityInput.disabled = !checkBox.checked;
            quantityInput.value = 0;
        };

        itemDetail.appendChild(checkBox);
        itemDetail.appendChild(quantityInput);
        itemDetail.appendChild(remainingText);
        itemDiv.appendChild(itemDetail);
        itemList.appendChild(itemDiv);

        checkboxes.push({itemId: item.ProduktID, quantityInput, itemCost: item.Cena, remainingText});
    });

    const payButton = document.createElement('button');
    payButton.textContent = 'Pay';
    payButton.disabled = false;
    payButton.id = `pay-${itemList.id}`;
    payButton.onclick = () => handlePayment(order.TransakceID, checkboxes);
    itemList.appendChild(payButton);

    const button = document.createElement('button');
    button.textContent = 'Add Order Item';
    button.id = itemList.id;
    button.onclick = () => {
        currentOrderId = button.id;
        openItemModal();
    };
    itemList.appendChild(button);

    return itemList;
}

/**
 * Render categories for selection
 * @param {Array} categories - The categories to render
 */
function renderCategories(categories) {
    categoryList.innerHTML = '';
    categories.forEach(category => {
        const categoryItem = document.createElement("div");
        categoryItem.className = "category-item";
        categoryItem.innerHTML = `<h2>${category.Nazev}</h2>`;
        categoryList.appendChild(categoryItem);
        categoryItem.onclick = () => {
            productList.innerHTML = '';
            categoryList.style.display = 'none';
            productList.style.display = 'flex';
            getProducts(category.KategorieID);
        };
    });
}

/**
 * Render products for a specific category
 * @param {Array} products - The products to render
 */
function renderProducts(products) {
    productList.innerHTML = '';
    products.forEach(product => {
        const productItem = document.createElement("div");
        productItem.className = "product-item";
        productItem.innerHTML = `<h3>${product.Nazev}</h3>`;

        const price = document.createElement("p");
        price.textContent = `Price: ${product.Cena} Czk`;
        productItem.appendChild(price);

        const quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.min = "1";
        quantityInput.value = "1";
        quantityInput.id = `quantity-${product.ProduktID}`;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = product.Cena;
        checkbox.id = product.ProduktID;
        checkbox.onchange = () => handleCheckboxChange(checkbox, quantityInput);

        quantityInput.oninput = () => handleCheckboxChange(checkbox, quantityInput);

        productItem.appendChild(checkbox);
        productItem.appendChild(quantityInput);
        productList.appendChild(productItem);
    });
}

// Export UI functions
window.goBack = goBack;
window.openModal = openModal;
window.closeModal = closeModal;
window.openItemModal = openItemModal;
window.closeItemModal = closeItemModal;
window.renderOrders = renderOrders;
window.renderCategories = renderCategories;
window.renderProducts = renderProducts;
