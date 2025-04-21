/**
 * Allergen model - handles database operations for allergens
 */
const { sql, poolPromise } = require("../config/db");

/**
 * Create a new allergen
 */
async function create(allergen) {
    const { Nazev } = allergen;

    if (!Nazev) {
        throw new Error("Missing allergen name");
    }
    
    try {
        const pool = await poolPromise;
        
        // Check if allergen already exists
        const checkAllergen = await pool.request()
            .input("Nazev", sql.VarChar, Nazev)
            .query("SELECT COUNT(*) AS Count FROM Alergen WHERE Nazev = @Nazev");
        
        if (checkAllergen.recordset[0].Count > 0) {
            throw new Error("Allergen already exists");
        }
        
        const result = await pool.request()
            .input("Nazev", sql.VarChar, Nazev)
            .query(`
                INSERT INTO Alergen (Nazev)
                VALUES (@Nazev);
                SELECT SCOPE_IDENTITY() AS AlergenID;
            `);
        
        return result.recordset[0].AlergenID;
    } catch (err) {
        throw err;
    }
}

/**
 * Get all allergens
 */
async function getAll() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Alergen");
        return result.recordset;
    } catch (err) {
        throw err;
    }
}

/**
 * Get allergen by ID
 */
async function getById(allergenId) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("AlergenID", sql.Int, allergenId)
            .query("SELECT * FROM Alergen WHERE AlergenID = @AlergenID");
        
        if (result.recordset.length === 0) {
            throw new Error("Allergen not found");
        }
        
        return result.recordset[0];
    } catch (err) {
        throw err;
    }
}

/**
 * Update an allergen
 */
async function update(allergenId, allergen) {
    const { Nazev } = allergen;
    
    if (!Nazev) {
        throw new Error("Missing allergen name");
    }
    
    try {
        const pool = await poolPromise;
        
        // Check if allergen name already exists for another allergen
        const checkAllergen = await pool.request()
            .input("Nazev", sql.VarChar, Nazev)
            .input("AlergenID", sql.Int, allergenId)
            .query("SELECT COUNT(*) AS Count FROM Alergen WHERE Nazev = @Nazev AND AlergenID != @AlergenID");
        
        if (checkAllergen.recordset[0].Count > 0) {
            throw new Error("Allergen name already exists");
        }
        
        const result = await pool.request()
            .input("AlergenID", sql.Int, allergenId)
            .input("Nazev", sql.VarChar, Nazev)
            .query(`
                UPDATE Alergen
                SET Nazev = @Nazev
                WHERE AlergenID = @AlergenID;
            `);
        
        if (result.rowsAffected[0] === 0) {
            throw new Error("Allergen not found");
        }
        
        return true;
    } catch (err) {
        throw err;
    }
}

/**
 * Delete an allergen
 */
async function remove(allergenId) {
    try {
        const pool = await poolPromise;
        
        // Check if allergen is associated with any products
        const checkProducts = await pool.request()
            .input("AlergenID", sql.Int, allergenId)
            .query("SELECT COUNT(*) AS Count FROM ProduktAlergen WHERE AlergenID = @AlergenID");
        
        if (checkProducts.recordset[0].Count > 0) {
            throw new Error("Cannot delete allergen associated with products");
        }
        
        const result = await pool.request()
            .input("AlergenID", sql.Int, allergenId)
            .query("DELETE FROM Alergen WHERE AlergenID = @AlergenID");
        
        if (result.rowsAffected[0] === 0) {
            throw new Error("Allergen not found");
        }
        
        return true;
    } catch (err) {
        throw err;
    }
}

/**
 * Get allergens for a product
 */
async function getByProductId(productId) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("ProduktID", sql.Int, productId)
            .query(`
                SELECT a.AlergenID, a.Nazev
                FROM Alergen a
                JOIN ProduktAlergen pa ON a.AlergenID = pa.AlergenID
                WHERE pa.ProduktID = @ProduktID
            `);
        
        return result.recordset;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    create,
    getAll,
    getById,
    update,
    remove,
    getByProductId
};