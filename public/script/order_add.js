const categoryList = document.getElementById("category-list-container");
const productList = document.getElementById("product-list-container");
let currentOrderId = '';
let selectedItems = [];

function goBack() {
    categoryList.style.display = 'flex';
    productList.style.display = 'none';
}

function openModal() {
    document.getElementById('order-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById("order-modal").style.display = "none";
}

function openItemModal() {
    document.getElementById('add-item-modal').style.display = 'block';
    categoryList.style.display = 'flex';
    productList.style.display = 'none';
    getCategories();
    selectedItems = [];
}

function closeItemModal() {
    document.getElementById('add-item-modal').style.display = "none";
}

function saveOrder() {
    const orderName = document.getElementById("order-name").value;
    fetch('/order-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orderName })
    });
    closeModal();
    getOrders();
}

window.onclick = function (event) {
    if (event.target === document.getElementById("order-modal")) {
        closeModal();
    }
    if (event.target === document.getElementById("add-item-modal")) {
        closeItemModal();
    }
};

function saveOrderItem() {
    if (selectedItems.length === 0) {
        alert("Please select at least one product.");
        return;
    }

    axios.post('/order-save/' + currentOrderId, selectedItems)
        .then(() => {
            closeItemModal();
            getOrders();
        })
        .catch(() => {
            alert('Failed to save the order items.');
        });
}

function handleCheckboxChange(event) {
    const checkbox = event.target;
    const productId = checkbox.id;
    const price = checkbox.value;

    if (checkbox.checked) {
        selectedItems.push({
            productId: productId,
            quantity: 1,
            price: price
        });
    } else {
        selectedItems = selectedItems.filter(item => item.productId !== productId);
    }
}

function fetchOrders() {
    return fetch('/order')
        .then(response => response.json())
        .catch(() => []);
}

function renderOrders(orders) {
    const orderList = document.getElementById("order-list-container");
    orderList.innerHTML = '';

    Object.values(orders).forEach(order => {
        const orderItem = document.createElement("div");
        orderItem.className = "order-item";
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

        // Zajištění, že položky existují a jsou předány funkci renderOrderItems
        const itemList = renderOrderItems(order);
        dropDown.onclick = () => {
            itemList.style.display = itemList.style.display === "none" ? "block" : "none";
        };

        orderItem.appendChild(itemList);
        orderList.appendChild(orderItem);
    });
}


function groupOrders(data) {
    return data.reduce((acc, item) => {
        const transakceID = item.TransakceID;
        if (!acc[transakceID]) {
            acc[transakceID] = {
                TransakceID: transakceID,
                Nazev: item.TransakceNazev || "Unknown Order",
                UzivatelJmeno: item.UzivatelJmeno || "Unknown User",
                DatumTransakce: item.DatumTransakce || "Unknown Date",
                Items: []
            };
        }
        console.log(item);
        if (item.Items.length > 0) {
            item.Items.forEach(
                item => acc[transakceID].Items.push({
                ProduktID: item.ProduktID,
                ProduktNazev: item.ProduktNazev || "Unnamed Product",
                Mnozstvi: item.Mnozstvi || 0,
                Cena: item.Cena || 0,
                Zaplaceno: item.Zaplaceno || false,
                Alergeny: item.Alergeny || []
            })
        )
        }
        return acc;
    }, {});
}
function renderOrderItems(order) {
    const itemList = document.createElement("div");
    itemList.className = "item-list";
    itemList.style.display = "none";
    itemList.id = order.TransakceID;

    if (!order.Items || order.Items.length === 0) {
        const noItemsMessage = document.createElement("p");
        noItemsMessage.textContent = "This order has no items.";
        itemList.appendChild(noItemsMessage);
    } else {
        order.Items.forEach(item => {
            const itemDetail = document.createElement("p");
            const allergens = item.Alergeny.length > 0 ? item.Alergeny.join(", ") : "None";
            itemDetail.textContent = `${item.ProduktNazev}: ${item.Mnozstvi}x ${item.Cena.toFixed(2)} EUR (Allergens: ${allergens})`;
            itemList.appendChild(itemDetail);
        });
    }

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


function getOrders() {
    fetchOrders()
        .then(data => {
            return groupOrders(data);
        })
        .then(orders => renderOrders(orders))
        .catch(error => console.error('Error processing orders:', error));
}

function getCategories() {
    fetch('/categories')
        .then(response => response.json())
        .then(data => {
            categoryList.innerHTML = '';
            data.forEach(category => {
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
        });
}

function getProducts(categoryId) {
    fetch('/products/' + categoryId)
        .then(response => response.json())
        .then(data => {
            productList.innerHTML = '';
            data.forEach(product => {
                const productItem = document.createElement("div");
                productItem.className = "product-item";
                productItem.innerHTML = `<h3>${product.Nazev}</h3>`;
                const price = document.createElement("p");
                price.textContent = `Price: ${product.Cena} EUR`;
                productItem.appendChild(price);

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = product.Cena;
                checkbox.id = product.ProduktID;
                checkbox.onchange = handleCheckboxChange;

                productItem.appendChild(checkbox);
                productList.appendChild(productItem);
            });
        });
}

document.addEventListener("DOMContentLoaded", getOrders);
