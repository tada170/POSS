const path = require("path");
const projectPath = path.join(__dirname, "..");

function defineHTMLEndpoints(aplication,isAuthenticated){
  
    aplication.get("/product-add", isAuthenticated, (req, res) => {
      res.sendFile(path.join(projectPath, "html", "product_add.html"));
    });
  
    aplication.get("/user-add", isAuthenticated, (req, res) => {
      res.sendFile(path.join(projectPath, "html", "user_add.html"));
    });
  
    aplication.get("/products-list", isAuthenticated, (req, res) => {
      res.sendFile(path.join(projectPath, "html", "products_list.html"));
    });
  
    aplication.get("/", isAuthenticated, (req, res) => {
      res.sendFile(path.join(projectPath, "html", "index.html"));
    });
  
    aplication.get("/login", (req, res) => {
      res.sendFile(path.join(projectPath, "html", "login.html"));
    });
}
module.exports = {defineHTMLEndpoints}