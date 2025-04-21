let allergensList = [];

async function loadCategories() {
    try {
        const response = await axios.get('/api/categories');
        const categories = response.data;
        const categorySelect = document.getElementById('categoryID');

        categories.forEach(category => {
            const optionHTML = `<option value="${category.KategorieID}">${category.Nazev}</option>`;
            categorySelect.innerHTML += optionHTML;
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadAllergens() {
    try {
        const response = await axios.get('/api/allergens');
        allergensList = response.data;
        populateAllergenDropdown();
    } catch (error) {
        console.error('Error loading allergens:', error);
    }
}

function populateAllergenDropdown() {
    const allergensDropdown = document.getElementById('allergen-dropdown');
    allergensDropdown.innerHTML = '<option value="">--Choose an allergen--</option>';

    allergensList.forEach(allergen => {
        const optionHTML = `<option value="${allergen.AlergenID}">${allergen.Nazev}</option>`;
        allergensDropdown.innerHTML += optionHTML;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadAllergens();
});

function addAllergen() {
    const dropdown = document.getElementById("allergen-dropdown");
    const selectedAllergenID = dropdown.value;
    const selectedAllergensDiv = document.getElementById("selected-allergens");

    if (selectedAllergenID) {
        const selectedAllergen = allergensList.find(allergen => allergen.AlergenID == selectedAllergenID);
        const allergenDiv = document.createElement("div");
        allergenDiv.className = "selected-allergen";
        allergenDiv.textContent = selectedAllergen.Nazev;

        const cross = document.createElement("span");
        cross.className = "cross";
        cross.textContent = '×';
        cross.onclick = function () {
            selectedAllergensDiv.removeChild(allergenDiv);
            dropdown.options[dropdown.options.length] = new Option(selectedAllergen.Nazev, selectedAllergen.AlergenID);
        };

        allergenDiv.appendChild(cross);
        selectedAllergensDiv.appendChild(allergenDiv);

        const optionToRemove = [...dropdown.options].find(option => option.value === selectedAllergenID);
        dropdown.remove(optionToRemove.index);
        dropdown.value = "";
    }
}

document.getElementById('productForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const productName = document.getElementById('productName').value;
    const productPrice = document.getElementById('productPrice').value;
    const categoryID = document.getElementById('categoryID').value;
    const allergens = Array.from(document.querySelectorAll('#selected-allergens .selected-allergen')).map(allergen => {
        const allergenName = allergen.textContent.slice(0, -1);
        const allergenObject = allergensList.find(a => a.Nazev === allergenName);
        return allergenObject ? allergenObject.AlergenID : null;
    }).filter(id => id !== null);

    try {
        const response = await axios.post('/api/products', {
            Nazev: productName,
            Cena: parseFloat(productPrice),
            KategID: parseInt(categoryID),
            Alergeny: allergens
        });
        console.log(response);
        document.getElementById('message').innerHTML = `<div class="alert alert-success">Product added successfully!</div>`;
    } catch (error) {
        console.error(error);
        document.getElementById('message').innerHTML = `<div class="alert alert-danger">Error adding product!</div>`;
    }
});
