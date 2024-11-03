const sql = require('mssql')
require("dotenv").config({ path: "../.env" });

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        enableArithAbort: process.env.DB_ENABLE_ARITH_ABORT === "true",
        trustServerCertificate: process.env.DB_TRUST_CERTIFICATE === "true",
    },
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MSSQL')
        return pool
    })
    .catch(err => console.log('Database Connection Failed! Bad Config: ', err))

module.exports = {
    sql, poolPromise
}