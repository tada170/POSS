/**
 * Main server file
 */
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const session = require('express-session');
require("dotenv").config();

// Import routes
const pageRoutes = require("./routes/pages");
const apiRoutes = require("./routes/api");

// Create Express app
const app = express();
const port = process.env.PORT || 5000;

// Configure app
configureApp(app);

// Register routes
app.use("/", pageRoutes);
app.use("/api", apiRoutes);

// Start server
startServer(app);

/**
 * Configure Express app with middleware
 */
function configureApp(application) {
  // Session middleware
  application.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,             
    saveUninitialized: false,   
    cookie: {
      httpOnly: true,         
      secure: process.env.NODE_ENV === 'production',
    }
  }));
  
  // Static files middleware
  application.use(express.static(path.join(__dirname, "..", "public")));
  
  // API middleware
  application.use(cors());
  application.use(bodyParser.json());
}

/**
 * Start the Express server
 */
function startServer(application) {
  application.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

module.exports = app; // Export for testing