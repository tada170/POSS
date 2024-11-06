const {defineAPIProductEndpoints} = require("./product");
const {defineAPIRoleEndpoints} = require("./role");
const {defineAPICategoryEndpoints} = require("./category");
const {defineAPIAlergenEndpoints} = require("./alergen");
const {configureUserHandeling} = require("./user");
const {defineAPIOrderEndpoints} = require("./order");

function defineAPIEndpoints(aplication, dbPoolPromise) {
    defineAPIProductEndpoints(aplication, dbPoolPromise);
    defineAPIRoleEndpoints(aplication,dbPoolPromise);
    defineAPICategoryEndpoints(aplication,dbPoolPromise);
    defineAPIAlergenEndpoints(aplication,dbPoolPromise);
    configureUserHandeling(aplication,dbPoolPromise);
    defineAPIOrderEndpoints(aplication, dbPoolPromise);
}
module.exports = {defineAPIEndpoints}