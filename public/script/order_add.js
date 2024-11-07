function openModal() {
    document.getElementById('order-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById("order-modal").style.display = "none";
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
function getOrders() {
    fetch('/order')
       .then(response => response.json())
       .then(orders => {
            const orderList = document.getElementById("order-list-container");
            orderList.innerHTML = '';
            orders.forEach(order => {
                const orderItem = document.createElement("div");
                orderItem.className = "order-item";
                orderItem.textContent = order.Nazev;
                orderList.appendChild(orderItem);

                const dropDown = document.createElement("span");
                dropDown.className = "drop-down-btn";
                dropDown.textContent = '▼';
                orderItem.appendChild(dropDown);
            });
        })
       .catch(error => console.error('Error:', error));
}
getOrders()