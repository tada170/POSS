document.addEventListener("DOMContentLoaded", () => {
    fetchUsers();
  });
  
  async function fetchUsers() {
    try {
      const response = await fetch("/users");
      const users = await response.json();
      const tableBody = document.querySelector("#user-table tbody");
      tableBody.innerHTML = "";
  
      users.forEach((user) => {
        const row = document.createElement("tr");
        const nameCell = document.createElement("td");
        const lastNameCell = document.createElement("td");
        const emailCell = document.createElement("td");
        const actionsCell = document.createElement("td");
  
        nameCell.textContent = user.Jmeno;
        lastNameCell.textContent = user.Prijmeni;
        emailCell.textContent = user.Email;
  
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "btn-delete";
        deleteButton.onclick = () => deleteUser(user.UzivatelID);
  
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "btn-edit";
        editButton.onclick = () => openEditModal(user);
  
        actionsCell.appendChild(deleteButton);
        actionsCell.appendChild(editButton);
        row.appendChild(nameCell);
        row.appendChild(lastNameCell);
        row.appendChild(emailCell);
        row.appendChild(actionsCell);
        tableBody.appendChild(row);
      });
    } catch (error) {
      displayMessage("Error fetching users: " + error.message, "error");
    }
  }
  
  async function deleteUser(userId) {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await fetch(`/users/${userId}`, {
          method: "DELETE",
        });
        displayMessage("User deleted successfully!", "success");
        fetchUsers();
      } catch (error) {
        displayMessage("Error deleting user: " + error.message, "error");
      }
    }
  }
  
  function openEditModal(user) {
    document.getElementById("edit-first-name").value = user.Jmeno;
    document.getElementById("edit-last-name").value = user.Prijmeni;
    document.getElementById("edit-email").value = user.Email;
    
    document.getElementById("edit-modal").style.display = "block";
    document.getElementById("edit-modal").setAttribute("data-user-id", user.UzivatelID);
  }
  
  function closeModal() {
    document.getElementById("edit-modal").style.display = "none";
  }
  
  async function saveUserChanges() {
    const userId = document.getElementById("edit-modal").getAttribute("data-user-id");
    const updatedUser = {
      Jmeno: document.getElementById("edit-first-name").value,
      Prijmeni: document.getElementById("edit-last-name").value,
      Email: document.getElementById("edit-email").value
    };
  
    try {
      await fetch(`/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedUser)
      });
      displayMessage("User updated successfully!", "success");
      closeModal();
      fetchUsers();
    } catch (error) {
      displayMessage("Error updating user: " + error.message, "error");
    }
  }
  
  function displayMessage(message, type) {
    const messageContainer = document.getElementById("message-container");
    const messageDiv = document.createElement("div");
    messageDiv.textContent = message;
    messageDiv.className = "alert " + (type === "success" ? "alert-success" : "alert-danger");
    messageContainer.appendChild(messageDiv);
    setTimeout(() => {
      messageContainer.removeChild(messageDiv);
    }, 3000);
  }
  
  window.onclick = function(event) {
    if (event.target === document.getElementById("edit-modal")) {
      closeModal();
    }
  };
  