const sql = require("mssql");

function defineAPICategoryEndpoints(aplication, dbPoolPromise) {
    aplication.get("/categories", async (req, res) => {
        try {
            const pool = await dbPoolPromise;
            const result = await pool.request().query("SELECT * FROM Kategorie");
            res.json(result.recordset);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving categories");
        }
    });
    aplication.post('/addCategory', async (req, res) => {
        const { Nazev } = req.body;

        if (!Nazev) {
            return res.status(400).json({ error: "Missing category name" });
        }

        try {
            const pool = await dbPoolPromise;
            const request = new sql.Request(pool);
            request.input("Nazev", sql.VarChar, Nazev);

            await request.query(`
                INSERT INTO Kategorie (Nazev)
                VALUES (@Nazev);
            `);

            res.status(201).json({ message: "Category added successfully" });
        } catch (err) {
            console.error("Error adding category:", err);
            res.status(500).json({ error: "Error adding category" });
        }
    });
}
module.exports = { defineAPICategoryEndpoints }