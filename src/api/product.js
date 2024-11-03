const sql = require("mssql");

function defineAPIProductEndpoints(aplication, dbPoolPromise) {
    aplication.post("/products", async (req, res) => {

        const { Nazev, Cena, KategID, Alergeny } = req.body;

        if (!Nazev || !Cena || !KategID) {
            return res.status(400).send("Missing product details");
        }
        const pool = await dbPoolPromise;
        const transaction = new sql.Transaction(pool);

        try {
            console.log("Starting database transaction");
            await transaction.begin();

            const insertProduct = new sql.Request(transaction);
            insertProduct.input("Nazev", sql.VarChar, Nazev);
            insertProduct.input("Cena", sql.Decimal(10, 2), Cena);
            insertProduct.input("KategID", sql.Int, KategID);

            console.log("Inserting product into database:", {
                Nazev,
                Cena,
                KategID,
            });

            const productResult = await insertProduct.query(`
                INSERT INTO Produkt (Nazev, Cena, KategorieID)
                VALUES (@Nazev, @Cena, @KategID);
                SELECT SCOPE_IDENTITY() AS ProduktID;
            `);

            const ProduktID = productResult.recordset[0].ProduktID;
            console.log("Inserted product with ID:", ProduktID);

            const insertAllergens = new sql.Request(transaction);
            for (const alergen of Alergeny) {
                const insertAllergen = new sql.Request(transaction);
                insertAllergen.input("ProduktID", sql.Int, ProduktID);
                insertAllergen.input("AlergenID", sql.Int, alergen);

                console.log(
                    `Inserting allergen with ID ${alergenID} for product ID ${ProduktID}`
                );

                await insertAllergen.query(`
                    INSERT INTO ProduktAlergen (ProduktID, AlergenID)
                    VALUES (@ProduktID, @AlergenID);
                `);
            }

            await transaction.commit();
            console.log("Transaction committed successfully");
            res.status(201).send("Product and allergens added successfully");
        } catch (err) {
            console.error("Error during transaction:", err);
            await transaction.rollback();
            res.status(500).send("Error adding product or allergens");
        }
    });

    aplication.get("/products", async (req, res) => {
        try {
            const pool = await dbPoolPromise;
            const result = await pool.request().query("SELECT * FROM Produkt");
            res.json(result.recordset);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving products");
        }
    });

    aplication.get("/products-listed", async (req, res) => {
        try {
            const pool = await dbPoolPromise;
            const result = await pool.request().query(`
                SELECT 
                    p.ProduktID, 
                    p.Nazev AS ProduktNazev, 
                    p.Cena, 
                    a.AlergenID, 
                    a.Nazev AS AlergenNazev
                FROM 
                    Produkt p
                LEFT JOIN 
                    ProduktAlergen pa ON p.ProduktID = pa.ProduktID
                LEFT JOIN 
                    Alergen a ON pa.AlergenID = a.AlergenID
                ORDER BY 
                    p.ProduktID, a.AlergenID;
            `);
            res.json(result.recordset);
        } catch (err) {
            console.error("Error retrieving products:", err);
            res.status(500).send("Error retrieving products");
        }
    });
    aplication.delete("/products/:id", async (req, res) => {
        const productId = req.params.id;
        let transaction;

        try {
            const pool = await dbPoolPromise;
            transaction = new sql.Transaction(pool);
            await transaction.begin();
            console.log(`Started transaction for product ID ${productId}`);

            await transaction
                .request()
                .input("ProduktID", sql.Int, productId)
                .query("DELETE FROM PolozkaTransakce WHERE ProduktID = @ProduktID");
            console.log(`Cleared references in PolozkaTransakce for product ID ${productId}`);

            await transaction
                .request()
                .input("ProduktID", sql.Int, productId)
                .query("DELETE FROM ProduktAlergen WHERE ProduktID = @ProduktID");
            console.log(`Cleared allergens for product ID ${productId}`);

            const deleteProduct = await transaction
                .request()
                .input("ProduktID", sql.Int, productId)
                .query("DELETE FROM Produkt WHERE ProduktID = @ProduktID");

            if (deleteProduct.rowsAffected[0] === 0) {
                console.log(`No product found with ID ${productId}`);
                return res.status(404).send("Product not found");
            }

            await transaction.commit();
            console.log(`Transaction committed successfully for product ID ${productId}`);
            res.sendStatus(204);
        } catch (error) {
            console.error("Error deleting product:", error);
            if (transaction) await transaction.rollback();
            res.status(500).send("Error deleting product");
        }
    });

    aplication.put("/products/:id", async (req, res) => {
        const productId = req.params.id;
        const { Nazev, Cena, Alergeny } = req.body;

        try {
            const pool = await dbPoolPromise;
            const transaction = new sql.Transaction(pool);
            await transaction.begin();
            console.log(`Started transaction for product ID ${productId}`);

            const updateRequest = transaction
                .request()
                .input("ProduktID", sql.Int, productId)
                .input("Nazev", sql.VarChar, Nazev)
                .input("Cena", sql.Decimal(10, 2), Cena);

            console.log(`Updating product with ID ${productId}:`, { Nazev, Cena });

            const updateResult = await updateRequest.query(`
            UPDATE Produkt
            SET Nazev = @Nazev, Cena = @Cena
            WHERE ProduktID = @ProduktID;
        `);

            if (updateResult.rowsAffected[0] === 0) {
                console.log(`No rows updated for product ID ${productId}`);
                return res.status(404).send("Product not found");
            }

            await transaction
                .request()
                .input("ProduktID", sql.Int, productId)
                .query("DELETE FROM ProduktAlergen WHERE ProduktID = @ProduktID;");
            console.log(`Cleared allergens for product ID ${productId}`);

            for (const alergen of Alergeny) {
                console.log(
                    `Inserting allergen with ID ${alergen} for product ID ${productId}`
                );

                await transaction
                    .request()
                    .input("ProduktID", sql.Int, productId)
                    .input("AlergenID", sql.Int, alergen).query(`
                    INSERT INTO ProduktAlergen (ProduktID, AlergenID)
                    VALUES (@ProduktID, @AlergenID);
                `);
            }
            await transaction.commit();
            console.log(`Transaction committed successfully for product ID ${productId}`);
            res.status(200).send("Product updated successfully");
        } catch (err) {
            console.error("Error updating product:", err);
            await transaction.rollback();
            res.status(500).send("Error updating product");
        }
    });
}
module.exports = { defineAPIProductEndpoints }