document.addEventListener("DOMContentLoaded", () => {
  fetchCategories();
});

async function fetchCategories() {
  try {
    const response = await fetch("http://localhost:3000/categories");
    const categories = await response.json();
    console.log(categories);

    const tableBody = document.querySelector("#category-table tbody");
    tableBody.innerHTML = "";

    categories.forEach((category) => {
      const row = document.createElement("tr");
      const nameCell = document.createElement("td");
      const actionsCell = document.createElement("td");

      nameCell.textContent = category.Nazev;

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.className = "btn-delete";
      deleteButton.onclick = () => deleteCategory(category.KategorieID);

      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.className = "btn-edit";
      editButton.onclick = () => openEditModal(category);

      actionsCell.appendChild(deleteButton);
      actionsCell.appendChild(editButton);
      row.appendChild(nameCell);
      row.appendChild(actionsCell);
      tableBody.appendChild(row);
    });
  } catch (error) {
    displayMessage("Error fetching categories: " + error.message, "error");
  }
}

async function deleteCategory(categoryId) {
  if (confirm("Are you sure you want to delete this category?")) {
    try {
      await fetch(`http://localhost:3000/categories/${categoryId}`, {
        method: "DELETE",
      });
      displayMessage("Category deleted successfully!", "success");
      fetchCategories();
    } catch (error) {
      displayMessage("Error deleting category: " + error.message, "error");
    }
  }
}

function openEditModal(category) {
  document.getElementById("edit-category-name").value = category.Nazev;
  const editModal = document.getElementById("edit-modal");
  editModal.style.display = "block";
  editModal.setAttribute("data-category-id", category.KategorieID);
}

function closeModal() {
  document.getElementById("edit-modal").style.display = "none";
}

async function saveCategoryChanges() {
  const categoryID = document
    .getElementById("edit-modal")
    .getAttribute("data-category-id");
  const updatedCategory = {
    Nazev: document.getElementById("edit-category-name").value,
  };

  try {
    const response = await fetch(`http://localhost:3000/categories/${categoryID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedCategory),
    });
    
    if (!response.ok) {
      throw new Error("Failed to update category");
    }
    
    displayMessage("Category updated successfully!", "success");
    closeModal();
    fetchCategories();
  } catch (error) {
    displayMessage("Error updating category: " + error.message, "error");
  }
}

function displayMessage(message, type) {
  const messageContainer = document.getElementById("message-container");
  const messageDiv = document.createElement("div");
  messageDiv.textContent = message;
  messageDiv.className =
    "message " + (type === "success" ? "success" : "error");
  messageContainer.appendChild(messageDiv);
  setTimeout(() => {
    messageContainer.removeChild(messageDiv);
  }, 3000);
}

window.onclick = function (event) {
  if (event.target === document.getElementById("edit-modal")) {
    closeModal();
  }
};
