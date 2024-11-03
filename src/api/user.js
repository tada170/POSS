const sql = require("mssql");

function configureUserHandeling(aplication, dbPoolPromise) {
    aplication.post("/logout", (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send("Error logging out");
            }
            res.clearCookie('connect.sid');
            res.status(200).send("Logged out successfully");
        });
    });

    aplication.post("/login", async (req, res) => {
        const { username, password } = req.body;

        console.log("Received login attempt:", { username, password });

        if (!username || !password) {
            return res.status(400).send("Username and password are required");
        }

        try {
            const pool = await dbPoolPromise;
            const result = await pool
                .request()
                .input("username", sql.VarChar, username)
                .query("SELECT * FROM Uzivatel WHERE Email = @username");

            console.log("Query result:", result.recordset);

            if (result.recordset.length > 0) {
                const user = result.recordset[0];

                if (user.Heslo === password) {
                    req.session.userId = user.UzivatelID;
                    req.session.role = user.RoleID;

                    console.log('Session after login:', req.session);
                    return res.status(200).send("Login successful");
                } else {
                    return res.status(401).send("Invalid username or password");
                }
            } else {
                return res.status(401).send("Invalid username or password");
            }
        } catch (err) {
            console.error("Error during login:", err);
            return res.status(500).send("Error processing login request");
        }
    });

    aplication.post("/add-user", async (req, res) => {
        const { jmeno, prijmeni, email, heslo, roleID } = req.body;

        if (!jmeno || !prijmeni || !email || !heslo || !roleID) {
            return res.status(400).send("All fields are required");
        }

        try {
            const pool = await dbPoolPromise;
            const result = await pool
                .request()
                .input("jmeno", sql.VarChar, jmeno)
                .input("prijmeni", sql.VarChar, prijmeni)
                .input("email", sql.VarChar, email)
                .input("heslo", sql.VarChar, heslo)
                .input("roleID", sql.Int, roleID)
                .query(
                    "INSERT INTO Uzivatel (Jmeno, Prijmeni, Email, Heslo, RoleID) VALUES (@jmeno, @prijmeni, @email, @heslo, @roleID)"
                );

            res.status(200).send("User added successfully");
        } catch (err) {
            console.error("Error adding user:", err);
            res.status(500).send("Error adding user to the database");
        }
    });
}
module.exports = { configureUserHandeling }