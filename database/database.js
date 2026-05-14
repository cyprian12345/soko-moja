const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "soko.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("DB Error:", err.message);
    } else {
        console.log("SQLite connected to", dbPath);
    }
});

// Update tables with image_url columns
db.serialize(() => {
    // Drop and recreate products table with image_url
    db.run(`DROP TABLE IF EXISTS products`);
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

    // Drop and recreate categories table with image_url
    db.run(`DROP TABLE IF EXISTS categories`);
    db.run(`
        CREATE TABLE categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            image_url TEXT DEFAULT '',
            description TEXT DEFAULT ''
        )
    `);

    console.log("✅ Database tables recreated with image_url columns");
});

module.exports = db;