const sql = require("mssql");

function defineAPIOrderEndpoints(aplication, dbPoolPromise) {
    aplication.get("/order", async (req, res) => {
        console.log("GET /order request received");

        try {
            const pool = await dbPoolPromise;
            console.log("Database pool obtained");

            const result = await pool.request().query(`
                SELECT *
                FROM V_TransakceDetail
                ORDER BY TransakceID, PolozkaTransakceID;
            `);
            console.log("Query executed successfully. Number of records retrieved:", result.recordset.length);

            const transactions = new Map();
            console.log(result)
            result.recordset.forEach(row => {
                if (!transactions.has(row.TransakceID)) {
                    transactions.set(row.TransakceID, {
                        TransakceID: row.TransakceID,
                        TransakceNazev: row.TransakceNazev,
                        UzivatelJmeno: row.UzivatelJmeno,
                        DatumTransakce: row.DatumTransakce,
                        Items: []
                    });
                }

                if (row.PolozkaTransakceID) {
                    const item = {
                        PolozkaTransakceID: row.PolozkaTransakceID,
                        ProduktID: row.ProduktID,
                        ProduktNazev: row.ProduktNazev,
                        Mnozstvi: row.Mnozstvi,
                        Cena: row.Cena,
                        Zaplaceno: row.Zaplaceno,
                        Alergeny: row.AlergenNazev ? [row.AlergenNazev] : []
                    };

                    const existingItem = transactions.get(row.TransakceID).Items.find(i => i.PolozkaTransakceID === row.PolozkaTransakceID);
                    if (existingItem) {
                        if (row.AlergenNazev) existingItem.Alergeny.push(row.AlergenNazev);
                    } else {
                        transactions.get(row.TransakceID).Items.push(item);
                    }
                }
            });

            res.json([...transactions.values()]);
        } catch (err) {
            console.error("Error retrieving orders:", err);
            res.status(500).send("Error retrieving orders");
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

            const result = await request.query(`
                INSERT INTO Transakce (Nazev, UzivatelID)
                    OUTPUT INSERTED.TransakceID
                VALUES (@Nazev, @UzivatelID);
            `);

            const insertedId = result.recordset[0].TransakceID;
            res.status(201).json({message: "Order added successfully", TransakceID: insertedId});
        } catch (err) {
            console.error("Error adding order:", err);
            res.status(500).json({error: "Error adding order"});
        }
    });

    aplication.post('/order-save/:id', async (req, res) => {
        const orderId = req.params.id;
        const items = req.body;

        try {
            const pool = await dbPoolPromise;

            await Promise.all(items.map(async (item) => {
                const quantity = item.quantity;

                // Pro každý item, který má množství větší než 1, vytvoříme tolik záznamů, kolik je položek
                for (let i = 0; i < quantity; i++) {
                    const request = new sql.Request(pool);
                    request.input("TransakceID", sql.Int, orderId);
                    request.input("ProduktID", sql.Int, item.productId);
                    request.input("Mnozstvi", sql.Int, 1);  // Množství bude vždy 1
                    request.input("Cena", sql.Int, item.price);

                    await request.query(`
                        INSERT INTO PolozkaTransakce (TransakceID, ProduktID, Mnozstvi, Cena)
                        VALUES (@TransakceID, @ProduktID, @Mnozstvi, @Cena);
                    `);
                }
            }));

            res.status(200).json({message: "Order updated successfully"});
        } catch (err) {
            console.error("Error updating order:", err);
            res.status(500).json({error: "Error updating order"});
        }
    });

    aplication.post('/payment/:id', async (req, res) => {
        const orderId = req.params.id;
        const { paymentData } = req.body;
        console.log("Paid Order ID: ", orderId);
        console.log("Payment Data: ", paymentData);

        if (!Array.isArray(paymentData) || paymentData.length === 0) {
            return res.status(400).json({ error: "No items to pay." });
        }

        try {
            const pool = await dbPoolPromise;

            await Promise.all(paymentData.map(async (item) => {
                const request = new sql.Request(pool);
                request.input("TransakceID", sql.Int, orderId);
                request.input("ProduktID", sql.Int, item.ProduktID);
                request.input("Mnozstvi", sql.Int, item.Mnozstvi);

                await request.query(`
                    WITH TopRows AS (
                        SELECT TOP (@Mnozstvi) PolozkaTransakceID
                        FROM PolozkaTransakce
                        WHERE ProduktID = @ProduktID
                          AND TransakceID = @TransakceID
                          AND Zaplaceno = 0
                        ORDER BY PolozkaTransakceID
                    )
                    UPDATE PolozkaTransakce
                    SET Zaplaceno = 1
                    WHERE PolozkaTransakceID IN (SELECT PolozkaTransakceID FROM TopRows);
                `);
            }));

            res.status(200).json({ message: "Payment processed successfully" });
        } catch (err) {
            console.error("Error processing payment:", err);
            res.status(500).json({ error: "Error processing payment" });
        }
    });

}

module.exports = {defineAPIOrderEndpoints};
