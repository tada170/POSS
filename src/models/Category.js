/**
 * Category model - handles database operations for categories
 */
const { sql, poolPromise } = require("../config/db");
const { executeQuery, beginTransaction, createRequest, recordExists } = require("../utils/dbUtils");

/**
 * Create a new category
 */
async function create(category) {
    const { Nazev } = category;

    if (!Nazev) {
        throw new Error("Missing category name");
    }

    try {
        const result = await executeQuery(`
            INSERT INTO Kategorie (Nazev)
            VALUES (@Nazev);
            SELECT SCOPE_IDENTITY() AS KategorieID;
        `, { Nazev });

        return result[0].KategorieID;
    } catch (err) {
        throw err;
    }
}

/**
 * Get all categories
 */
async function getAll() {
    try {
        return await executeQuery("SELECT * FROM Kategorie");
    } catch (err) {
        throw err;
    }
}

/**
 * Get category by ID
 */
async function getById(categoryId) {
    try {
        const result = await executeQuery(
            "SELECT * FROM Kategorie WHERE KategorieID = @KategorieID",
            { KategorieID: categoryId }
        );

        if (result.length === 0) {
            throw new Error("Category not found");
        }

        return result[0];
    } catch (err) {
        throw err;
    }
}

/**
 * Update a category
 */
async function update(categoryId, category) {
    const { Nazev } = category;

    if (!Nazev) {
        throw new Error("Missing category name");
    }

    try {
        const result = await executeQuery(`
            UPDATE Kategorie
            SET Nazev = @Nazev
            WHERE KategorieID = @KategorieID;
            SELECT @@ROWCOUNT AS AffectedRows;
        `, { 
            KategorieID: categoryId,
            Nazev 
        });

        if (result[0].AffectedRows === 0) {
            throw new Error("Category not found");
        }

        return true;
    } catch (err) {
        throw err;
    }
}

/**
 * Delete a category
 */
async function remove(categoryId) {
    try {
        // Check if category has products
        const hasProducts = await recordExists(
            "Produkt", 
            "KategorieID", 
            categoryId
        );

        if (hasProducts) {
            throw new Error("Cannot delete category with associated products");
        }

        const result = await executeQuery(`
            DELETE FROM Kategorie 
            WHERE KategorieID = @KategorieID;
            SELECT @@ROWCOUNT AS AffectedRows;
        `, { 
            KategorieID: categoryId 
        });

        if (result[0].AffectedRows === 0) {
            throw new Error("Category not found");
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
