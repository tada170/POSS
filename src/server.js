const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sql = require("mssql");
const path = require("path");
require("dotenv").config({ path: "../.env" });
const session = require('express-session');
const projectPath = path.join(__dirname, "..");
const app = express();
const port = 3000;
const { poolPromise } = require("./db_conn");
const { defineHTMLEndpoints } = require("./pages");
const { defineAPIEndpoints } = require("./api/api")


const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    console.log('User is authenticated');
    return next();
  } else {
    console.log('User is not authenticated, redirecting to login');
    return res.redirect('/login');
  }
};

const hasRole = (roles) => {
  return (req, res, next) => {
    if (req.session.role && roles.includes(req.session.role)) {
      return next();
    }
    res.status(403).send("Forbidden: You do not have access to this page");
  };
};

configureApp(app);
defineHTMLEndpoints(app, isAuthenticated);
defineAPIEndpoints(app, poolPromise);
startServer(app);

function configureApp(aplication) {
  aplication.use(session({
    secret: 'secret_key',
    resave: false,             
    saveUninitialized: false,   
    cookie: {
      httpOnly: true,         
      secure: false,
    }
  }));
  aplication.use(express.static(path.join(projectPath, "public")));
  aplication.use(cors());
  aplication.use(bodyParser.json());
}

function startServer(aplication) {
  aplication.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}