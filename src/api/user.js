const sql = require("mssql");

function configureUserHandeling(aplication, dbPoolPromise) {
  aplication.post("/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Error logging out");
      }
      res.clearCookie("connect.sid");
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

          console.log("Session after login:", req.session);
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
  aplication.get("/users", async (req, res) => {
    try {
      const pool = await dbPoolPromise;
      const result = await pool.request().query("SELECT * FROM Uzivatel");
      res.json(result.recordset);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error retrieving users");
    }
  });
  aplication.delete("/users/:id", async (req, res) => {
    const userId = req.params.id;

    try {
      const pool = await dbPoolPromise;
      const request = new sql.Request(pool);
      request.input("UserId", sql.Int, userId);

      const result = await request.query(
        `DELETE FROM Uzivatel WHERE UzivatelID = @UserId`
      );

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ error: "Error deleting user" });
    }
  });
  aplication.put("/users/:id", async (req, res) => {
    const userId = req.params.id;
    const { Jmeno, Prijmeni, Email } = req.body;

    try {
        const pool = await dbPoolPromise;

        const updateRequest = pool
            .request()
            .input("UzivatelID", sql.Int, userId)
            .input("Jmeno", sql.VarChar, Jmeno)
            .input("Prijmeni", sql.VarChar, Prijmeni)
            .input("Email", sql.VarChar, Email);

        console.log(`Updating user with ID ${userId}:`, { Jmeno, Prijmeni, Email });

        const updateResult = await updateRequest.query(`
            UPDATE Uzivatel
            SET Jmeno = @Jmeno, Prijmeni = @Prijmeni, Email = @Email
            WHERE UzivatelID = @UzivatelID;
        `);

        if (updateResult.rowsAffected[0] === 0) {
            console.log(`No rows updated for user ID ${userId}`);
            return res.status(404).send("User not found");
        }

        console.log(`User ID ${userId} updated successfully`);
        res.status(200).send("User updated successfully");
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).send("Error updating user");
    }
});  
}
module.exports = { configureUserHandeling };
