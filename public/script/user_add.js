async function loadRole() {
    try {
        const response = await axios.get("/roles");
        const roles = response.data;

        const roleSelect = document.getElementById("roleID");
        roles.forEach((role) => {
            const option = document.createElement("option");
            option.value = role.RoleID;
            option.textContent = role.NazevRole;
            roleSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading roles:", error);
    }
}

document.getElementById("addUserForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const jmeno = document.getElementById("jmeno").value;
    const prijmeni = document.getElementById("prijmeni").value;
    const email = document.getElementById("email").value;
    const heslo = document.getElementById("heslo").value;
    const roleID = document.getElementById("roleID").value;

    console.log("Form submission:", { jmeno, prijmeni, email, heslo, roleID });

    fetch("/add-user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ jmeno, prijmeni, email, heslo, roleID }),
    })
        .then((response) => {
            if (response.ok) {
                alert("User added successfully");
                document.getElementById("addUserForm").reset();
            } else {
                alert("Failed to add user");
            }
        })
        .catch((error) => {
            console.error("Error adding user:", error);
        });
});

loadRole();