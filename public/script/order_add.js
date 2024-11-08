function openModal() {
    document.getElementById('order-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById("order-modal").style.display = "none";
}

function openItemModal(){
    document.getElementById('add-item-modal').style.display = 'block';
}
function  closeItemModal(){
    document.getElementById('add-item-modal')
}
function saveOrder() {
    const orderName = document.getElementById("order-name").value;
    fetch('/order-add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: orderName})
    })
    alert(`Order '${orderName}' saved!`);
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
    fetch('/order-add-item/' + document.getElementById('order-id').value, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            ProduktID: document.getElementById('product-id').value,
            Mnozstvi: document.getElementById('quantity').value,
            Cena: document.getElementById('price').value
        })
    })
}
function getOrders() {
    console.log("Fetching orders...");

    fetch('/order')
        .then(response => response.json())
        .then(data => {
            console.log("Data received from server:", data);

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
                console.log("Rendering order:", order);

                const orderItem = document.createElement("div");
                orderItem.className = "order-item";

                const orderTitle = document.createElement("span");
                orderTitle.textContent = `Order: ${order.Nazev}  (${order.DatumTransakce})`;

                const dropDown = document.createElement("span");
                dropDown.className = "drop-down-btn";
                dropDown.textContent = ' ▼';
                dropDown.style.cursor = "pointer";

                orderItem.appendChild(orderTitle);
                orderItem.appendChild(dropDown);

                const itemList = document.createElement("div");
                itemList.className = "item-list";
                itemList.style.display = "none";
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
                button.id = 'submitOrderButton';
                button.onclick = () =>{
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

console.log("Initializing order retrieval...");
getOrders();
