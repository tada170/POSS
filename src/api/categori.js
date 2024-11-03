const sql = require("mssql");

function defineAPICategoriEndpoints(aplication, dbPoolPromise) {
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
}
module.exports = { defineAPICategoriEndpoints }