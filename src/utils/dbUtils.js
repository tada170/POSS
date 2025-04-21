/**
 * Database utility functions
 */
const { sql, poolPromise } = require("../config/db");

/**
 * Execute a query with parameters
 * @param {string} query - SQL query to execute
 * @param {Object} params - Parameters for the query
 * @returns {Promise<Array>} - Query results
 */
async function executeQuery(query, params = {}) {
    try {
        const pool = await poolPromise;
        const request = pool.request();
        
        // Add parameters to request
        for (const [key, value] of Object.entries(params)) {
            if (value === null) {
                request.input(key, sql.VarChar, null);
            } else if (typeof value === 'number') {
                if (Number.isInteger(value)) {
                    request.input(key, sql.Int, value);
                } else {
                    request.input(key, sql.Decimal(10, 2), value);
                }
            } else if (typeof value === 'boolean') {
                request.input(key, sql.Bit, value);
            } else if (value instanceof Date) {
                request.input(key, sql.DateTime, value);
            } else {
                request.input(key, sql.VarChar, value);
            }
        }
        
        const result = await request.query(query);
        return result.recordset || [];
    } catch (err) {
        console.error('Database error:', err);
        throw err;
    }
}

/**
 * Begin a transaction
 * @returns {Promise<Object>} - Transaction object
 */
async function beginTransaction() {
    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        return transaction;
    } catch (err) {
        console.error('Error beginning transaction:', err);
        throw err;
    }
}

/**
 * Create a request with a transaction
 * @param {Object} transaction - Transaction object
 * @param {Object} params - Parameters for the request
 * @returns {Object} - Request object
 */
function createRequest(transaction, params = {}) {
    const request = new sql.Request(transaction);
    
    // Add parameters to request
    for (const [key, value] of Object.entries(params)) {
        if (value === null) {
            request.input(key, sql.VarChar, null);
        } else if (typeof value === 'number') {
            if (Number.isInteger(value)) {
                request.input(key, sql.Int, value);
            } else {
                request.input(key, sql.Decimal(10, 2), value);
            }
        } else if (typeof value === 'boolean') {
            request.input(key, sql.Bit, value);
        } else if (value instanceof Date) {
            request.input(key, sql.DateTime, value);
        } else {
            request.input(key, sql.VarChar, value);
        }
    }
    
    return request;
}

/**
 * Check if a record exists
 * @param {string} table - Table name
 * @param {string} field - Field name
 * @param {any} value - Field value
 * @param {number} excludeId - ID to exclude (for updates)
 * @param {string} idField - ID field name
 * @returns {Promise<boolean>} - True if record exists
 */
async function recordExists(table, field, value, excludeId = null, idField = null) {
    try {
        const pool = await poolPromise;
        const request = pool.request();
        request.input('value', value);
        
        let query = `SELECT COUNT(*) AS Count FROM ${table} WHERE ${field} = @value`;
        
        if (excludeId !== null && idField !== null) {
            query += ` AND ${idField} != @excludeId`;
            request.input('excludeId', sql.Int, excludeId);
        }
        
        const result = await request.query(query);
        return result.recordset[0].Count > 0;
    } catch (err) {
        console.error('Error checking record existence:', err);
        throw err;
    }
}

module.exports = {
    executeQuery,
    beginTransaction,
    createRequest,
    recordExists,
    sql
};