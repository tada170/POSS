# POSS - Point of Sale System

A web-based Point of Sale System for managing products, categories, orders, and users.

## Project Structure

The project follows a structured organization:

```
POSS/
├── public/                  # Client-side assets
│   ├── html/                # HTML templates
│   ├── script/              # Client-side JavaScript
│   └── styles/              # CSS stylesheets
├── src/                     # Server-side code
│   ├── config/              # Configuration files
│   │   └── db.js            # Database configuration
│   ├── controllers/         # Business logic
│   │   └── productController.js  # Product operations
│   ├── middleware/          # Middleware functions
│   │   └── auth.js          # Authentication middleware
│   ├── models/              # Database models
│   ├── routes/              # Route definitions
│   │   ├── api/             # API routes
│   │   │   ├── index.js     # API routes coordinator
│   │   │   └── product.js   # Product API routes
│   │   └── pages/           # HTML page routes
│   │       └── index.js     # Page routes coordinator
│   ├── utils/               # Utility functions
│   └── server.js            # Main application entry point
├── .env                     # Environment variables
├── databaze.sql             # Database schema
├── package.json             # Project metadata and dependencies
└── README.md                # Project documentation
```

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=3000
   SESSION_SECRET=your_secret_key
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_SERVER=your_db_server
   DB_DATABASE=your_db_name
   DB_ENABLE_ARITH_ABORT=true
   DB_TRUST_CERTIFICATE=true
   ```
4. Initialize the database using `databaze.sql`

## Running the Application

### Development Mode
```
npm run dev
```

### Production Mode
```
npm start
```

## API Endpoints

The API follows RESTful conventions:

### Products
- `GET /api/products` - Get all products
- `GET /api/products/category/:categoryId` - Get products by category
- `GET /api/products/with-allergens` - Get products with allergens
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Categories, Users, Orders
Similar RESTful endpoints are available for other entities.

## Pages

- `/` - Home page
- `/login` - Login page
- `/product-add` - Add product page
- `/product-list` - List products page
- `/category-add` - Add category page
- `/category-list` - List categories page
- `/user-add` - Add user page
- `/user-list` - List users page
- `/order-add` - Add order page
