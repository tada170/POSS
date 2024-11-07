const sql = require("mssql");
const {userId} = require("express-session");


function defineAPIOrderEndpoints(aplication, dbPoolPromise) {
    aplication.get("/order", async (req, res) => {
        try {
            const pool = await dbPoolPromise;
            const result = await pool.request().query("SELECT Nazev FROM Transakce");
            res.json(result.recordset);
        } catch (err) {
            console.error("Error retrieving categories:", err);
            res.status(500).send("Error retrieving categories");
        }
    });
    aplication.post('/order-add', async (req, res) => {
        const {name} = req.body;

        if (!name) {
            return res.status(400).json({error: "Missing order name"});
        }

        try {
            const pool = await dbPoolPromise;
            const request = new sql.Request(pool);

            request.input("Nazev", sql.VarChar, name);
            request.input("UzivatelID", sql.Int, req.session.userId);

            await request.query(`
                INSERT INTO Transakce (Nazev, UzivatelID)
                VALUES (@Nazev, @UzivatelID);
            `);

            res.status(201).json({message: "Order added successfully"});
        } catch (err) {
            console.error("Error adding order:", err);
            res.status(500).json({error: "Error adding order"});
        }

    });
}

module.exports = {defineAPIOrderEndpoints};