const sql = require("mssql");

function defineAPIRoleEndpoints(aplication, dbPoolPromise) {
    aplication.get("/roles", async (req, res) => {
        try {
            const pool = await dbPoolPromise;
            const result = await pool.request().query("SELECT * FROM Role");
            res.json(result.recordset);
        } catch (err) {
            console.error(err);
            res.status(500).send("Error retrieving role");
        }
    });
}
module.exports = { defineAPIRoleEndpoints }