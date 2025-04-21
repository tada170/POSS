/**
 * Role model - handles database operations for user roles
 */
const { sql, poolPromise } = require("../config/db");

/**
 * Create a new role
 */
async function create(role) {
    const { Nazev } = role;

    if (!Nazev) {
        throw new Error("Missing role name");
    }

    try {
        const pool = await poolPromise;

        // Check if role already exists
        const checkRole = await pool.request()
            .input("NazevRole", sql.VarChar, Nazev)
            .query("SELECT COUNT(*) AS Count FROM Role WHERE NazevRole = @NazevRole");

        if (checkRole.recordset[0].Count > 0) {
            throw new Error("Role already exists");
        }

        const result = await pool.request()
            .input("NazevRole", sql.VarChar, Nazev)
            .query(`
                INSERT INTO Role (NazevRole)
                VALUES (@NazevRole);
                SELECT SCOPE_IDENTITY() AS RoleID;
            `);

        return result.recordset[0].RoleID;
    } catch (err) {
        throw err;
    }
}

/**
 * Get all roles
 */
async function getAll() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Role");
        return result.recordset;
    } catch (err) {
        throw err;
    }
}

/**
 * Get role by ID
 */
async function getById(roleId) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("RoleID", sql.Int, roleId)
            .query("SELECT * FROM Role WHERE RoleID = @RoleID");

        if (result.recordset.length === 0) {
            throw new Error("Role not found");
        }

        return result.recordset[0];
    } catch (err) {
        throw err;
    }
}

/**
 * Update a role
 */
async function update(roleId, role) {
    const { Nazev } = role;

    if (!Nazev) {
        throw new Error("Missing role name");
    }

    try {
        const pool = await poolPromise;

        // Check if role name already exists for another role
        const checkRole = await pool.request()
            .input("NazevRole", sql.VarChar, Nazev)
            .input("RoleID", sql.Int, roleId)
            .query("SELECT COUNT(*) AS Count FROM Role WHERE NazevRole = @NazevRole AND RoleID != @RoleID");

        if (checkRole.recordset[0].Count > 0) {
            throw new Error("Role name already exists");
        }

        const result = await pool.request()
            .input("RoleID", sql.Int, roleId)
            .input("NazevRole", sql.VarChar, Nazev)
            .query(`
                UPDATE Role
                SET NazevRole = @NazevRole
                WHERE RoleID = @RoleID;
            `);

        if (result.rowsAffected[0] === 0) {
            throw new Error("Role not found");
        }

        return true;
    } catch (err) {
        throw err;
    }
}

/**
 * Delete a role
 */
async function remove(roleId) {
    try {
        const pool = await poolPromise;

        // Check if role is assigned to any users
        const checkUsers = await pool.request()
            .input("RoleID", sql.Int, roleId)
            .query("SELECT COUNT(*) AS Count FROM Uzivatel WHERE RoleID = @RoleID");

        if (checkUsers.recordset[0].Count > 0) {
            throw new Error("Cannot delete role assigned to users");
        }

        const result = await pool.request()
            .input("RoleID", sql.Int, roleId)
            .query("DELETE FROM Role WHERE RoleID = @RoleID");

        if (result.rowsAffected[0] === 0) {
            throw new Error("Role not found");
        }

        return true;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    create,
    getAll,
    getById,
    update,
    remove
};
