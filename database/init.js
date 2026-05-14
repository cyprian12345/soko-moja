const db = require('./database.js');

db.serialize(() => {
    // Drop existing tables
    db.run(`DROP TABLE IF EXISTS products`);
    db.run(`DROP TABLE IF EXISTS categories`);

    // Create categories table
    db.run(`
        CREATE TABLE categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            image_url TEXT DEFAULT '',
            description TEXT DEFAULT ''
        )
    `);

    // Create products table
    db.run(`
        CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL DEFAULT 0,
            image_url TEXT DEFAULT '',
            description TEXT DEFAULT ''
        )
    `);

    // Insert initial categories (so you can add products)
    const categories = [
        { name: "Fruits", image_url: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400", description: "Fresh seasonal fruits" },
        { name: "Vegetables", image_url: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400", description: "Organic vegetables" },
        { name: "Dairy", image_url: "https://images.unsplash.com/photo-1628088062854-d1874a45b9d5?w=400", description: "Fresh dairy products" },
        { name: "Grains", image_url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400", description: "Whole grains" },
        { name: "Meat", image_url: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400", description: "Premium meat" }
    ];

    categories.forEach(cat => {
        db.run("INSERT INTO categories (name, image_url, description) VALUES (?, ?, ?)",
            [cat.name, cat.image_url, cat.description]);
    });

    // Insert sample products
    const products = [
        { name: "Fresh Apples", category: "Fruits", price: 2.99, image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400", description: "Crisp sweet apples" },
        { name: "Organic Bananas", category: "Fruits", price: 1.49, image_url: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400", description: "Ripe bananas" },
        { name: "Fresh Carrots", category: "Vegetables", price: 1.99, image_url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5ae37?w=400", description: "Organic carrots" },
        { name: "Fresh Milk", category: "Dairy", price: 3.99, image_url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400", description: "Farm fresh milk" }
    ];

    products.forEach(prod => {
        db.run("INSERT INTO products (name, category, price, image_url, description) VALUES (?, ?, ?, ?, ?)",
            [prod.name, prod.category, prod.price, prod.image_url, prod.description]);
    });

    console.log("✅ Database initialized!");

    // Show what was added
    setTimeout(() => {
        db.all("SELECT * FROM categories", (err, rows) => {
            console.log("Categories:", rows);
        });
        db.all("SELECT * FROM products", (err, rows) => {
            console.log("Products:", rows);
        });
        setTimeout(() => process.exit(), 1000);
    }, 100);
});