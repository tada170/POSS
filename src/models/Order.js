/**
 * Order model - handles database operations for orders (transactions)
 */
const { sql, poolPromise } = require("../config/db");

/**
 * Create a new order
 */
async function create(order) {
    const { UzivatelID, Polozky = [], Zaplaceno = false, Nazev = "New Order" } = order;

    if (!UzivatelID) {
        throw new Error("Missing user ID");
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // Create transaction
        const insertTransaction = new sql.Request(transaction);
        insertTransaction.input("UzivatelID", sql.Int, UzivatelID);
        insertTransaction.input("Zaplaceno", sql.Bit, Zaplaceno);
        insertTransaction.input("Nazev", sql.VarChar, Nazev);

        const transactionResult = await insertTransaction.query(`
            INSERT INTO Transakce (UzivatelID, DatumTransakce, Zaplaceno, Nazev)
            VALUES (@UzivatelID, GETDATE(), @Zaplaceno, @Nazev);
            SELECT SCOPE_IDENTITY() AS TransakceID;
        `);

        const TransakceID = transactionResult.recordset[0].TransakceID;

        // Calculate total price
        let totalPrice = 0;

        // Add items to transaction
        for (const polozka of Polozky) {
            const { ProduktID, Mnozstvi } = polozka;

            if (!ProduktID || !Mnozstvi) {
                throw new Error("Invalid order item");
            }

            // Get product price
            const priceRequest = new sql.Request(transaction);
            priceRequest.input("ProduktID", sql.Int, ProduktID);

            const priceResult = await priceRequest.query(`
                SELECT Cena FROM Produkt WHERE ProduktID = @ProduktID
            `);

            if (priceResult.recordset.length === 0) {
                throw new Error(`Product with ID ${ProduktID} not found`);
            }

            const productPrice = priceResult.recordset[0].Cena;
            const itemTotal = productPrice * Mnozstvi;
            totalPrice += itemTotal;

            // Insert order item
            const insertItem = new sql.Request(transaction);
            insertItem.input("TransakceID", sql.Int, TransakceID);
            insertItem.input("ProduktID", sql.Int, ProduktID);
            insertItem.input("Mnozstvi", sql.Int, Mnozstvi);
            insertItem.input("Cena", sql.Decimal(10, 2), productPrice);

            await insertItem.query(`
                INSERT INTO PolozkaTransakce (TransakceID, ProduktID, Mnozstvi, Cena)
                VALUES (@TransakceID, @ProduktID, @Mnozstvi, @Cena);
            `);
        }

        await transaction.commit();
        return { TransakceID };
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

/**
 * Get all orders
 */
async function getAll() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT *
            FROM V_TransakceDetail
            ORDER BY TransakceID, PolozkaTransakceID;
        `);
        const transactions = new Map();
        result.recordset.forEach(row => {
            if (!transactions.has(row.TransakceID)) {
                transactions.set(row.TransakceID, {
                    TransakceID: row.TransakceID,
                    TransakceNazev: row.TransakceNazev,
                    UzivatelJmeno: row.UzivatelJmeno,
                    DatumTransakce: row.DatumTransakce,
                    Items: [],
                    Zaplaceno: row.Zaplaceno
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

        return [...transactions.values()];
    } catch (err) {
        throw err;
    }
}

/**
 * Get order by ID with items
 */
async function getById(orderId) {
    try {
        const pool = await poolPromise;

        // Get order details
        const orderResult = await pool.request()
            .input("TransakceID", sql.Int, orderId)
            .query(`
                SELECT t.TransakceID, t.DatumTransakce, t.Zaplaceno,
                       u.UzivatelID, u.Jmeno, u.Prijmeni
                FROM Transakce t
                JOIN Uzivatel u ON t.UzivatelID = u.UzivatelID
                WHERE t.TransakceID = @TransakceID
            `);

        if (orderResult.recordset.length === 0) {
            throw new Error("Order not found");
        }

        const order = orderResult.recordset[0];

        // Get order items
        const itemsResult = await pool.request()
            .input("TransakceID", sql.Int, orderId)
            .query(`
                SELECT pt.PolozkaID, pt.ProduktID, pt.Mnozstvi, pt.Cena,
                       p.Nazev AS ProduktNazev
                FROM PolozkaTransakce pt
                JOIN Produkt p ON pt.ProduktID = p.ProduktID
                WHERE pt.TransakceID = @TransakceID
            `);

        order.Polozky = itemsResult.recordset;

        return order;
    } catch (err) {
        throw err;
    }
}

/**
 * Update order payment status
 */
async function updatePaymentStatus(orderId, isPaid) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("TransakceID", sql.Int, orderId)
            .input("Zaplaceno", sql.Bit, isPaid)
            .query(`
                UPDATE Transakce
                SET Zaplaceno = @Zaplaceno
                WHERE TransakceID = @TransakceID;
            `);

        if (result.rowsAffected[0] === 0) {
            throw new Error("Order not found");
        }

        return true;
    } catch (err) {
        throw err;
    }
}

/**
 * Delete an order
 */
async function remove(orderId) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // Delete order items
        await transaction
            .request()
            .input("TransakceID", sql.Int, orderId)
            .query("DELETE FROM PolozkaTransakce WHERE TransakceID = @TransakceID");

        // Delete order
        const deleteOrder = await transaction
            .request()
            .input("TransakceID", sql.Int, orderId)
            .query("DELETE FROM Transakce WHERE TransakceID = @TransakceID");

        if (deleteOrder.rowsAffected[0] === 0) {
            throw new Error("Order not found");
        }

        await transaction.commit();
        return true;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

/**
 * Get orders by user ID
 */
async function getByUserId(userId) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("UzivatelID", sql.Int, userId)
            .query(`
                SELECT t.TransakceID, t.DatumTransakce, t.CelkovaCena, t.Zaplaceno
                FROM Transakce t
                WHERE t.UzivatelID = @UzivatelID
                ORDER BY t.DatumTransakce DESC
            `);

        return result.recordset;
    } catch (err) {
        throw err;
    }
}

/**
 * Get remaining items to pay for an order
 */
async function getRemainingItems(orderId) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("TransakceID", sql.Int, orderId)
            .query(`
                SELECT pt.ProduktID, SUM(pt.Mnozstvi) AS Mnozstvi
                FROM PolozkaTransakce pt
                WHERE pt.TransakceID = @TransakceID
                AND pt.Zaplaceno = 0
                GROUP BY pt.ProduktID
            `);

        return result.recordset;
    } catch (err) {
        throw err;
    }
}

/**
 * Add items to an existing order
 * @param {number} orderId - The ID of the order
 * @param {Array} items - The items to add to the order
 * @returns {Promise<boolean>} - True if successful
 */
async function addItems(orderId, items) {
    if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
        throw new Error("Missing order items");
    }

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // Check if order exists
        const checkOrder = new sql.Request(transaction);
        checkOrder.input("TransakceID", sql.Int, orderId);
        const orderResult = await checkOrder.query("SELECT * FROM Transakce WHERE TransakceID = @TransakceID");

        if (orderResult.recordset.length === 0) {
            throw new Error(`Order with ID ${orderId} not found`);
        }

        // Add items to transaction
        for (const item of items) {
            const { productId, price, quantity } = item;

            if (!productId || !quantity) {
                throw new Error("Invalid order item");
            }

            // Get product price if not provided
            let productPrice = price;
            if (!productPrice) {
                const priceRequest = new sql.Request(transaction);
                priceRequest.input("ProduktID", sql.Int, productId);
                const priceResult = await priceRequest.query("SELECT Cena FROM Produkt WHERE ProduktID = @ProduktID");

                if (priceResult.recordset.length === 0) {
                    throw new Error(`Product with ID ${productId} not found`);
                }

                productPrice = priceResult.recordset[0].Cena;
            }

            // Insert order item
            const insertItem = new sql.Request(transaction);
            insertItem.input("TransakceID", sql.Int, orderId);
            insertItem.input("ProduktID", sql.Int, productId);
            insertItem.input("Mnozstvi", sql.Int, quantity);
            insertItem.input("Cena", sql.Decimal(10, 2), productPrice);

            await insertItem.query(`
                INSERT INTO PolozkaTransakce (TransakceID, ProduktID, Mnozstvi, Cena)
                VALUES (@TransakceID, @ProduktID, @Mnozstvi, @Cena);
            `);
        }

        await transaction.commit();
        return true;
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

module.exports = {
    create,
    getAll,
    getById,
    updatePaymentStatus,
    remove,
    getByUserId,
    getRemainingItems,
    addItems
};
