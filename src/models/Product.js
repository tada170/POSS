/**
 * Product model - handles database operations for products
 */
const { sql, poolPromise } = require("../config/db");
const { beginTransaction, createRequest, executeQuery } = require("../utils/dbUtils");

/**
 * Create a new product with allergens
 */
async function create(product) {
    const { Nazev, Cena, KategID, Alergeny } = product;

    if (!Nazev || !Cena || !KategID) {
        throw new Error("Missing product details");
    }

    let transaction;

    try {
        transaction = await beginTransaction();

        // Insert product
        const productParams = { Nazev, Cena, KategID };
        const productRequest = createRequest(transaction, productParams);

        const productResult = await productRequest.query(`
            INSERT INTO Produkt (Nazev, Cena, KategorieID)
            VALUES (@Nazev, @Cena, @KategID);
            SELECT SCOPE_IDENTITY() AS ProduktID;
        `);

        const ProduktID = productResult.recordset[0].ProduktID;

        // Insert allergens
        for (const alergen of Alergeny) {
            const allergenParams = { ProduktID, AlergenID: alergen };
            const allergenRequest = createRequest(transaction, allergenParams);

            await allergenRequest.query(`
                INSERT INTO ProduktAlergen (ProduktID, AlergenID)
                VALUES (@ProduktID, @AlergenID);
            `);
        }

        await transaction.commit();
        return ProduktID;
    } catch (err) {
        if (transaction) await transaction.rollback();
        throw err;
    }
}

/**
 * Get all products
 */
async function getAll() {
    try {
        return await executeQuery("SELECT * FROM Produkt");
    } catch (err) {
        throw err;
    }
}

/**
 * Get products by category
 */
async function getByCategory(categoryId) {
    try {
        return await executeQuery(
            "SELECT * FROM Produkt WHERE KategorieID = @categoryId",
            { categoryId }
        );
    } catch (err) {
        throw err;
    }
}

/**
 * Get products with allergens
 */
async function getWithAllergens() {
    try {
        return await executeQuery(`
            SELECT *
            FROM V_ProduktAlergen
            ORDER BY ProduktID, AlergenID;
        `);
    } catch (err) {
        throw err;
    }
}

/**
 * Delete a product
 */
async function remove(productId) {
    let transaction;

    try {
        transaction = await beginTransaction();

        // Delete order items referencing this product
        const orderItemsRequest = createRequest(transaction, { ProduktID: productId });
        await orderItemsRequest.query("DELETE FROM PolozkaTransakce WHERE ProduktID = @ProduktID");

        // Delete product allergens
        const allergensRequest = createRequest(transaction, { ProduktID: productId });
        await allergensRequest.query("DELETE FROM ProduktAlergen WHERE ProduktID = @ProduktID");

        // Delete the product
        const productRequest = createRequest(transaction, { ProduktID: productId });
        const deleteResult = await productRequest.query("DELETE FROM Produkt WHERE ProduktID = @ProduktID");

        if (deleteResult.rowsAffected[0] === 0) {
            throw new Error("Product not found");
        }

        await transaction.commit();
        return true;
    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }
}

/**
 * Update a product
 */
async function update(productId, product) {
    const { Nazev, Cena, Alergeny } = product;
    let transaction;

    try {
        transaction = await beginTransaction();

        // Update product details
        const updateParams = { ProduktID: productId, Nazev, Cena };
        const updateRequest = createRequest(transaction, updateParams);

        const updateResult = await updateRequest.query(`
            UPDATE Produkt
            SET Nazev = @Nazev, Cena = @Cena
            WHERE ProduktID = @ProduktID;
        `);

        if (updateResult.rowsAffected[0] === 0) {
            throw new Error("Product not found");
        }

        // Delete existing allergens
        const deleteAllergensRequest = createRequest(transaction, { ProduktID: productId });
        await deleteAllergensRequest.query("DELETE FROM ProduktAlergen WHERE ProduktID = @ProduktID;");

        // Insert new allergens
        for (const alergen of Alergeny) {
            const allergenParams = { ProduktID: productId, AlergenID: alergen };
            const insertAllergenRequest = createRequest(transaction, allergenParams);

            await insertAllergenRequest.query(`
                INSERT INTO ProduktAlergen (ProduktID, AlergenID)
                VALUES (@ProduktID, @AlergenID);
            `);
        }

        await transaction.commit();
        return true;
    } catch (err) {
        if (transaction) await transaction.rollback();
        throw err;
    }
}

module.exports = {
    create,
    getAll,
    getByCategory,
    getWithAllergens,
    remove,
    update
};
