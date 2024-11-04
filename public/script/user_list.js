document.addEventListener("DOMContentLoaded", () => {
    fetchUsers();
});

async function fetchUsers() {
    try {
        const response = await fetch('http://localhost:3000/users');
        const users = await response.json();
        const tableBody = document.querySelector('#user-table tbody');
        tableBody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            const nameCell = document.createElement('td');
            const lastNameCell = document.createElement('td');
            const emailCell = document.createElement('td');
            const actionsCell = document.createElement('td');

            nameCell.textContent = user.Jmeno;
            lastNameCell.textContent = user.Prijmeni;
            emailCell.textContent = user.Email;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'btn-delete';
            deleteButton.onclick = () => deleteUser(user.UzivatelID);

            actionsCell.appendChild(deleteButton);
            row.appendChild(nameCell);
            row.appendChild(lastNameCell);
            row.appendChild(emailCell);
            row.appendChild(actionsCell);
            tableBody.appendChild(row);
        });
    } catch (error) {
        displayMessage('Error fetching users: ' + error.message, 'error');
    }
}

async function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            await fetch(`http://localhost:3000/users/${userId}`, {
                method: 'DELETE',
            });
            displayMessage('User deleted successfully!', 'success');
            fetchUsers(); // Refresh the user list
        } catch (error) {
            displayMessage('Error deleting user: ' + error.message, 'error');
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