document.addEventListener("DOMContentLoaded", () => {
    const addCategoryForm = document.getElementById('addCategoryForm');
    const successMessage = document.querySelector('.success-message');
    const errorMessage = document.querySelector('.error-message');

    addCategoryForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const categoryName = document.getElementById('categoryName').value.trim();

        fetch('/addCategory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Nazev: categoryName })
        })
            .then(async response => {
                const data = await response.json();
                if (response.ok) {
                    successMessage.textContent = data.message || "Category added successfully!";
                    successMessage.style.display = 'block';
                    errorMessage.style.display = 'none';
                    addCategoryForm.reset();
                } else {
                    errorMessage.textContent = data.error || "Failed to add category.";
                    errorMessage.style.display = 'block';
                    successMessage.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                errorMessage.textContent = "An unexpected error occurred.";
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';
            });
    });
});
