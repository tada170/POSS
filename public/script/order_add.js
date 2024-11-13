const categoryList = document.getElementById("category-list-container");
const productList = document.getElementById("product-list-container");
let currentOrderId = '';
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
    getCategories()
}

function closeItemModal() {
    document.getElementById('add-item-modal').style.display = "none";

}

function saveOrder() {
    const orderName = document.getElementById("order-name").value;
    fetch('/order-add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: orderName})
    })
    closeModal();
}

window.onclick = function (event) {
    if (event.target === document.getElementById("order-modal")) {
        closeModal();
    }
};

window.onclick = function (event) {
    if (event.target === document.getElementById("add-item-modal")) {
        console.log("Clicked outside modal, closing it...");
        closeItemModal();
    }
};

function saveOrderItem() {
    const orderId = currentOrderId;
    console.log("Order ID:", orderId);

    const checkedItems = [];
    const checkboxes = document.querySelectorAll('.product-item input[type="checkbox"]:checked');

    checkboxes.forEach(checkbox => {
        console.log("Checked product ID:", checkbox.value);
        checkedItems.push({
            productId: checkbox.id,
            quantity: 1,
            price: checkbox.value
        });
    });

    console.log("Checked items:", checkedItems);

    if (checkedItems.length === 0) {
        alert("Please select at least one product.");
        return;
    }

    axios.post('/order-save/' + orderId, checkedItems)
        .then(response => {
            closeItemModal();
            getOrders();
        })

.catch(error => {
    console.error("Error details:", error);
    alert('Failed to save the order items.');
});

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
                const checkbox = document.createElement("INPUT");
                checkbox.setAttribute("type", "checkbox");
                checkbox.id = product.ProduktID;
                checkbox.value = product.Cena;
                productItem.appendChild(price)
                productItem.appendChild(checkbox)
                productList.appendChild(productItem);
            });
        });
}

function getOrders() {
    fetch('/order')
        .then(response => response.json())
        .then(data => {
            const orders = data.reduce((acc, item) => {
                const transakceID = item.TransakceID;
                if (!acc[transakceID]) {
                    acc[transakceID] = {
                        TransakceID: transakceID,
                        Nazev: item.TransakceNazev,
                        UzivatelJmeno: item.UzivatelJmeno,
                        DatumTransakce: item.DatumTransakce,
                        items: []
                    };
                }

                acc[transakceID].items.push({
                    ProduktID: item.ProduktID,
                    ProduktNazev: item.ProduktNazev,
                    Mnozstvi: item.Mnozstvi,
                    Cena: item.Cena,
                    Zaplaceno: item.Zaplaceno,
                    AlergenNazev: item.AlergenNazev
                });

                return acc;
            }, {});

            console.log("Grouped orders:", orders);

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

                const itemList = document.createElement("div");
                itemList.className = "item-list";
                itemList.style.display = "none";
                itemList.id = order.TransakceID;
                dropDown.onclick = () => {
                    itemList.style.display = itemList.style.display === "none" ? "block" : "none";
                };

                orderItem.appendChild(itemList);
                orderList.appendChild(orderItem);

                order.items.forEach(item => {
                    const itemDetail = document.createElement("p");

                    if (!item.ProduktID) {
                        itemDetail.textContent = 'No item in transaction';
                    } else {
                        let productText = item.ProduktID ? `${item.ProduktNazev}: ` : ''; // If ProduktID is present, show name
                        let allergenText = item.AlergenNazev ? `Allergens: ${item.AlergenNazev}` : ''; // Show allergens if available
                        itemDetail.textContent = `${productText}${item.Mnozstvi}X ${item.Cena} euro ${allergenText}`;
                    }
                    itemList.appendChild(itemDetail);
                });
                const button = document.createElement('button');
                button.textContent = 'Add Order Item';
                button.id = itemList.id;
                button.onclick = () => {
                    currentOrderId = button.id;
                    openItemModal()
                }
                itemList.appendChild(button)
                dropDown.onclick = () => {
                    itemList.style.display = itemList.style.display === "none" ? "block" : "none";
                };

                orderItem.appendChild(itemList);
                orderList.appendChild(orderItem);
            });
        })
        .catch(error => console.error('Error fetching orders:', error));
}

getOrders();
