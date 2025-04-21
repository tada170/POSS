let allergensList = [];
let selectedAllergens = [];
let initialAllergens = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    loadAllergens();
});

async function fetchProducts() {
    try {
        const response = await fetch('/api/products/with-allergens');
        const products = await response.json();
        const tableBody = document.querySelector('#product-table tbody');
        tableBody.innerHTML = '';

        const productMap = {};
        products.forEach(product => {
            const { ProduktID, ProduktNazev, Cena, AlergenNazev, AlergenID } = product;
            if (!productMap[ProduktID]) {
                productMap[ProduktID] = {
                    ProduktID,
                    ProduktNazev,
                    Cena,
                    Allergens: []
                };
            }
            if (AlergenNazev && AlergenID) {
                productMap[ProduktID].Allergens.push({ name: AlergenNazev, id: AlergenID });
            }
        });

        Object.values(productMap).forEach(product => {
            const row = document.createElement('tr');
            const nameCell = document.createElement('td');
            const priceCell = document.createElement('td');
            const allergensCell = document.createElement('td');
            const actionsCell = document.createElement('td');
            nameCell.textContent = product.ProduktNazev;
            priceCell.textContent = product.Cena;
            allergensCell.innerHTML = product.Allergens.length > 0 ? product.Allergens.map(allergen => `${allergen.name} <span class="allergen-icon" title="Edit" onclick="addAllergenToEdit('${allergen.name}')"></span>`).join(', ') : 'No allergens';
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'btn-delete';
            deleteButton.onclick = () => deleteProduct(product.ProduktID);
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'btn-edit';
            editButton.onclick = () => openEditModal(product);
            actionsCell.appendChild(deleteButton);
            actionsCell.appendChild(editButton);
            row.appendChild(nameCell);
            row.appendChild(priceCell);
            row.appendChild(allergensCell);
            row.appendChild(actionsCell);
            tableBody.appendChild(row);
        });
    } catch (error) {
        displayMessage('Error fetching products: ' + error.message, 'error');
    }
}

async function loadAllergens() {
    try {
        const response = await axios.get('/api/allergens');
        allergensList = response.data;
        populateAllergenDropdown();
    } catch (error) {
        displayMessage('Error loading allergens: ' + error.message, 'error');
    }
}

function populateAllergenDropdown() {
    const allergenDropdown = document.getElementById('allergen-dropdown');
    allergenDropdown.innerHTML = '<option value="">-- Choose an allergen --</option>'; // Přidáno výchozí zobrazení
    allergensList.forEach(allergen => {
        const option = document.createElement('option');
        option.value = allergen.AlergenID;
        option.textContent = allergen.Nazev;
        allergenDropdown.appendChild(option);
    });
    allergenDropdown.onchange = function () {
        const selectedOptions = Array.from(allergenDropdown.selectedOptions);
        selectedOptions.forEach(option => {
            addAllergenToEdit({ id: option.value, name: option.textContent });
            allergenDropdown.value = '';
        });
    };
}

function addAllergenToEdit(allergen) {
    if (allergen.id && allergen.name && !selectedAllergens.find(a => a.id === allergen.id)) {
        selectedAllergens.push(allergen);
        renderSelectedAllergens();
    }
}

function renderSelectedAllergens() {
    const selectedAllergenContainer = document.getElementById('selected-allergens');
    selectedAllergenContainer.innerHTML = '';
    selectedAllergens.forEach(allergen => {
        if (allergen.name) {
            const allergenItem = document.createElement('div');
            allergenItem.className = 'allergen-item';
            allergenItem.textContent = allergen.name;
            const removeButton = document.createElement('span');
            removeButton.className = 'remove-allergen';
            removeButton.textContent = '×';
            removeButton.onclick = () => removeAllergen(allergen.id);
            allergenItem.appendChild(removeButton);
            selectedAllergenContainer.appendChild(allergenItem);
        }
    });
}

function removeAllergen(allergenId) {
    selectedAllergens = selectedAllergens.filter(a => a.id !== allergenId);
    renderSelectedAllergens();
}

function openEditModal(product) {
    document.getElementById('productName').value = product.ProduktNazev;
    document.getElementById('productPrice').value = product.Cena;
    document.getElementById('productId').value = product.ProduktID;

    initialAllergens = product.Allergens.map(allergen => ({
        id: allergen.id,
        name: allergen.name
    })).filter(allergen => allergen.id && allergen.name);

    selectedAllergens = [...initialAllergens];
    renderSelectedAllergens();
    document.getElementById('editModal').style.display = 'block';
}

document.getElementById('closeModal').onclick = function () {
    closeModal();
};

function closeModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
    selectedAllergens = [...initialAllergens];
    renderSelectedAllergens();
}

window.onclick = function (event) {
    const modal = document.getElementById('editModal');
    if (event.target == modal) {
        closeModal();
    }
};

document.getElementById('editForm').onsubmit = async function (event) {
    event.preventDefault();
    const productId = document.getElementById('productId').value;
    const productName = document.getElementById('productName').value;
    const productPrice = document.getElementById('productPrice').value;
    const allergenIds = selectedAllergens.map(allergen => allergen.id).filter(id => id);

    try {
        await axios.put(`/api/products/${productId}`, {
            Nazev: productName,
            Cena: productPrice,
            Alergeny: allergenIds
        });
        displayMessage('Product updated successfully!', 'success');
        fetchProducts();
        closeModal();
    } catch (error) {
        displayMessage('Error updating product: ' + error.message, 'error');
    }
}

async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await axios.delete(`/api/products/${productId}`);
            displayMessage('Product deleted successfully!', 'success');
            fetchProducts();
        } catch (error) {
            displayMessage('Error deleting product: ' + error.message, 'error');
        }
    }
}

function displayMessage(message, type) {
    const messageContainer = document.getElementById('message-container');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.className = 'message ' + (type === 'success' ? 'success' : 'error');
    messageContainer.appendChild(messageDiv);
    setTimeout(() => {
        messageContainer.removeChild(messageDiv);
    }, 3000);
}
