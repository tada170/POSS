const sql = require("mssql");

function defineAPIAlergenEndpoints(aplication, dbPoolPromise) {
    aplication.get("/allergens", async (req, res) => {
        try {
            const pool = await dbPoolPromise;
            const result = await pool.request().query("SELECT * FROM Alergen");
            res.json(result.recordset);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving allergens");
        }
    });
}
module.exports = { defineAPIAlergenEndpoints }