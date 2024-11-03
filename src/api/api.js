const {defineAPIProductEndpoints} = require("./product");
const {defineAPIRoleEndpoints} = require("./role");
const {defineAPICategoriEndpoints} = require("./categori");
const {defineAPIAlergenEndpoints} = require("./alergen");
const {configureUserHandeling} = require("./user");

function defineAPIEndpoints(aplication, dbPoolPromise) {
    defineAPIProductEndpoints(aplication, dbPoolPromise);
    defineAPIRoleEndpoints(aplication,dbPoolPromise);
    defineAPICategoriEndpoints(aplication,dbPoolPromise);
    defineAPIAlergenEndpoints(aplication,dbPoolPromise);
    configureUserHandeling(aplication,dbPoolPromise );
}
module.exports = {defineAPIEndpoints}