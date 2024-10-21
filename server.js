const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');
const path = require('path'); // Import path for serving HTML files
require('dotenv').config({ path: './.env' });

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Read database configuration from environment variables
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        enableArithAbort: process.env.DB_ENABLE_ARITH_ABORT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERTIFICATE === 'true',
    }
};

// Connect to SQL Server
sql.connect(config).then(pool => {
    console.log('Connected to SQL Server');

    // Get all products
    app.get('/products', async (req, res) => {
        try {
            const result = await pool.request().query('SELECT * FROM Produkt');
            res.json(result.recordset);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error retrieving products');
        }
    });

    // Fetch allergens
    app.get('/allergens', async (req, res) => {
        try {
            const result = await pool.request().query('SELECT * FROM Alergen');
            res.json(result.recordset);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error retrieving allergens');
        }
    });

    // Fetch categories
    app.get('/categories', async (req, res) => {
        try {
            const result = await pool.request().query('SELECT * FROM Kategorie');
            res.json(result.recordset);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error retrieving categories');
        }
    });

    // Get products listed with allergens
    app.get('/products-listed', async (req, res) => {
        try {
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
            console.error('Error retrieving products:', err);
            res.status(500).send('Error retrieving products');
        }
    });

    // Serve HTML file on root route
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Serve products list HTML page
    app.get('/products-list', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'products_list.html'));
    });

    // Add a product with allergens
    app.post('/products', async (req, res) => {
        // Log the incoming request body
        console.log('Received request to add product:', req.body);

        const { Nazev, Cena, KategID, Alergeny } = req.body;

        // Check for missing fields and log accordingly
        if (!Nazev || !Cena || !KategID) {
            console.log('Validation failed: Missing product details');
            return res.status(400).send('Missing product details');
        }

        // Convert KategID to an integer
        const KategIDNumber = parseInt(KategID, 10);
        if (isNaN(KategIDNumber)) {
            console.log('Validation failed: KategID is not a valid number');
            return res.status(400).send('KategID must be a valid number');
        }

        const transaction = new sql.Transaction(pool);

        try {
            console.log('Starting database transaction');
            await transaction.begin();

            const insertProduct = new sql.Request(transaction);
            insertProduct.input('Nazev', sql.VarChar, Nazev);
            insertProduct.input('Cena', sql.Decimal(10, 2), Cena);
            insertProduct.input('KategID', sql.Int, KategIDNumber);

            console.log('Inserting product into database:', { Nazev, Cena, KategIDNumber });

            const productResult = await insertProduct.query(`
                INSERT INTO Produkt (Nazev, Cena, KategorieID)
                VALUES (@Nazev, @Cena, @KategID);
                SELECT SCOPE_IDENTITY() AS ProduktID;
            `);

            const ProduktID = productResult.recordset[0].ProduktID;
            console.log('Inserted product with ID:', ProduktID);

            const insertAllergens = new sql.Request(transaction);
            for (const alergen of Alergeny) {
                // Create a new request for each allergen
                const insertAllergen = new sql.Request(transaction);
                const alergenID = parseInt(alergen, 10); // Ensure the allergen ID is an integer

                insertAllergen.input('ProduktID', sql.Int, ProduktID);
                insertAllergen.input('AlergenID', sql.Int, alergenID);

                console.log(`Inserting allergen with ID ${alergenID} for product ID ${ProduktID}`);

                await insertAllergen.query(`
                    INSERT INTO ProduktAlergen (ProduktID, AlergenID)
                    VALUES (@ProduktID, @AlergenID);
                `);
            }

            await transaction.commit();
            console.log('Transaction committed successfully');
            res.status(201).send('Product and allergens added successfully');
        } catch (err) {
            console.error('Error during transaction:', err);
            await transaction.rollback();
            res.status(500).send('Error adding product or allergens');
        }
    });

    // Delete a product
    app.delete('/products/:id', async (req, res) => {
        const productId = req.params.id; // Get the product ID from the request parameters

        try {
            const deleteProduct = await pool.request()
                .input('ProduktID', sql.Int, productId)
                .query('DELETE FROM Produkt WHERE ProduktID = @ProduktID'); // SQL query to delete the product

            // Send a status code indicating no content
            res.sendStatus(204); // HTTP status code 204 means No Content
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).send('Error deleting product');
        }
    });

    // Update a product
    // Update a product
    // Update a product
    app.put('/products/:id', async (req, res) => {
        const productId = req.params.id; // Get the product ID from the request parameters
        const { Nazev, Cena, Alergeny } = req.body; // Destructure the request body

        // Log the incoming request data
        console.log(`Received request to update product ID ${productId}:`, req.body);

        try {
            const transaction = new sql.Transaction(pool);
            await transaction.begin();
            console.log(`Started transaction for product ID ${productId}`);

            // Update the product details
            const updateRequest = transaction.request()
                .input('ProduktID', sql.Int, productId)
                .input('Nazev', sql.VarChar, Nazev)
                .input('Cena', sql.Decimal(10, 2), Cena);

            console.log(`Updating product with ID ${productId}:`, { Nazev, Cena });

            const updateResult = await updateRequest.query(`
            UPDATE Produkt
            SET Nazev = @Nazev, Cena = @Cena
            WHERE ProduktID = @ProduktID;
        `);

            // Check if any rows were affected
            if (updateResult.rowsAffected[0] === 0) {
                console.log(`No rows updated for product ID ${productId}`);
                return res.status(404).send('Product not found');
            }

            // Clear existing allergens
            await transaction.request()
                .input('ProduktID', sql.Int, productId)
                .query('DELETE FROM ProduktAlergen WHERE ProduktID = @ProduktID;'); // Clear existing allergens
            console.log(`Cleared allergens for product ID ${productId}`);

            // Insert new allergens
            for (const alergen of Alergeny) {
                const alergenID = parseInt(alergen, 10); // Ensure allergen ID is an integer
                console.log(`Inserting allergen with ID ${alergenID} for product ID ${productId}`);

                await transaction.request()
                    .input('ProduktID', sql.Int, productId)
                    .input('AlergenID', sql.Int, alergenID)
                    .query(`
                    INSERT INTO ProduktAlergen (ProduktID, AlergenID)
                    VALUES (@ProduktID, @AlergenID);
                `);
            }

            await transaction.commit();
            console.log(`Transaction committed successfully for product ID ${productId}`);
            res.status(200).send('Product updated successfully');
        } catch (err) {
            console.error('Error updating product:', err);
            await transaction.rollback();
            res.status(500).send('Error updating product');
        }
    });



    // Start the server
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });

}).catch(err => {
    console.error('Database connection failed:', err);
});
