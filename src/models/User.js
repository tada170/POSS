/**
 * User model - handles database operations for users
 */
const { sql, poolPromise } = require("../config/db");
const bcrypt = require("bcrypt");

/**
 * Create a new user
 */
async function create(user) {
    const { Jmeno, Prijmeni, Email, Heslo, RoleID } = user;

    if (!Jmeno || !Prijmeni || !Email || !Heslo || !RoleID) {
        throw new Error("Missing user details");
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(Heslo, 10);

        const pool = await poolPromise;

        // Check if email already exists
        const checkEmail = await pool.request()
            .input("Email", sql.VarChar, Email)
            .query("SELECT COUNT(*) AS Count FROM Uzivatel WHERE Email = @Email");

        if (checkEmail.recordset[0].Count > 0) {
            throw new Error("Email already in use");
        }

        const result = await pool.request()
            .input("Jmeno", sql.VarChar, Jmeno)
            .input("Prijmeni", sql.VarChar, Prijmeni)
            .input("Email", sql.VarChar, Email)
            .input("Heslo", sql.VarChar, hashedPassword)
            .input("RoleID", sql.Int, RoleID)
            .query(`
                INSERT INTO Uzivatel (Jmeno, Prijmeni, Email, Heslo, RoleID)
                VALUES (@Jmeno, @Prijmeni, @Email, @Heslo, @RoleID);
                SELECT SCOPE_IDENTITY() AS UzivatelID;
            `);

        return result.recordset[0].UzivatelID;
    } catch (err) {
        throw err;
    }
}

/**
 * Get all users
 */
async function getAll() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT u.UzivatelID, u.Jmeno, u.Prijmeni, u.Email, r.NazevRole AS Role
            FROM Uzivatel u
            JOIN Role r ON u.RoleID = r.RoleID
        `);
        return result.recordset;
    } catch (err) {
        throw err;
    }
}

/**
 * Get user by ID
 */
async function getById(userId) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("UzivatelID", sql.Int, userId)
            .query(`
                SELECT u.UzivatelID, u.Jmeno, u.Prijmeni, u.Email, r.NazevRole AS Role, u.RoleID
                FROM Uzivatel u
                JOIN Role r ON u.RoleID = r.RoleID
                WHERE u.UzivatelID = @UzivatelID
            `);

        if (result.recordset.length === 0) {
            throw new Error("User not found");
        }

        return result.recordset[0];
    } catch (err) {
        throw err;
    }
}

/**
 * Update a user
 */
async function update(userId, user) {
    const { Jmeno, Prijmeni, Email, Heslo, RoleID } = user;

    if (!Jmeno || !Prijmeni || !Email || !RoleID) {
        throw new Error("Missing user details");
    }

    try {
        const pool = await poolPromise;

        // Check if email already exists for another user
        const checkEmail = await pool.request()
            .input("Email", sql.VarChar, Email)
            .input("UzivatelID", sql.Int, userId)
            .query("SELECT COUNT(*) AS Count FROM Uzivatel WHERE Email = @Email AND UzivatelID != @UzivatelID");

        if (checkEmail.recordset[0].Count > 0) {
            throw new Error("Email already in use");
        }

        let query = `
            UPDATE Uzivatel
            SET Jmeno = @Jmeno, Prijmeni = @Prijmeni, Email = @Email, RoleID = @RoleID
        `;

        const request = pool.request()
            .input("UzivatelID", sql.Int, userId)
            .input("Jmeno", sql.VarChar, Jmeno)
            .input("Prijmeni", sql.VarChar, Prijmeni)
            .input("Email", sql.VarChar, Email)
            .input("RoleID", sql.Int, RoleID);

        // If password is provided, update it
        if (Heslo) {
            const hashedPassword = await bcrypt.hash(Heslo, 10);
            query += ", Heslo = @Heslo";
            request.input("Heslo", sql.VarChar, hashedPassword);
        }

        query += " WHERE UzivatelID = @UzivatelID";

        const result = await request.query(query);

        if (result.rowsAffected[0] === 0) {
            throw new Error("User not found");
        }

        return true;
    } catch (err) {
        throw err;
    }
}

/**
 * Delete a user
 */
async function remove(userId) {
    try {
        const pool = await poolPromise;

        // Check if user has orders
        const checkOrders = await pool.request()
            .input("UzivatelID", sql.Int, userId)
            .query("SELECT COUNT(*) AS Count FROM Transakce WHERE UzivatelID = @UzivatelID");

        if (checkOrders.recordset[0].Count > 0) {
            throw new Error("Cannot delete user with associated orders");
        }

        const result = await pool.request()
            .input("UzivatelID", sql.Int, userId)
            .query("DELETE FROM Uzivatel WHERE UzivatelID = @UzivatelID");

        if (result.rowsAffected[0] === 0) {
            throw new Error("User not found");
        }

        return true;
    } catch (err) {
        throw err;
    }
}

/**
 * Authenticate a user
 */
async function authenticate(email, password) {
    try {
        console.log("Authenticating user with email:", email);

        const pool = await poolPromise;
        const result = await pool.request()
            .input("Email", sql.VarChar, email)
            .query(`
                SELECT u.UzivatelID, u.Jmeno, u.Prijmeni, u.Email, u.Heslo, r.NazevRole AS Role, u.RoleID
                FROM Uzivatel u
                JOIN Role r ON u.RoleID = r.RoleID
                WHERE u.Email = @Email
            `);

        console.log("Query result:", result.recordset.length > 0 ? "User found" : "User not found");

        if (result.recordset.length === 0) {
            throw new Error("Invalid email or password");
        }

        const user = result.recordset[0];
        console.log("Comparing passwords");

        try {
            //const passwordMatch = await bcrypt.compare(password, user.Heslo);
            if(password !== user.Heslo){
                throw new Error("Invalid email or password");
            }

            // Don't return the password
            delete user.Heslo;

            return user;
        } catch (bcryptError) {
            console.error("Bcrypt error:", bcryptError);
            throw new Error("Invalid email or password");
        }
    } catch (err) {
        console.error("Authentication error:", err);
        throw new Error("Invalid email or password");
    }
}

module.exports = {
    create,
    getAll,
    getById,
    update,
    remove,
    authenticate
};
