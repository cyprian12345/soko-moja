const express = require("express");
const router = express.Router();
const db = require("../database/database");

// GET all products
router.get("/", (req, res) => {
    db.all("SELECT * FROM products ORDER BY name", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET single product
router.get("/:id", (req, res) => {
    db.get("SELECT * FROM products WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Product not found" });
        res.json(row);
    });
});

// CREATE product
router.post("/", (req, res) => {
    const { name, category, price, image_url, description, discount_percent } = req.body;

    db.run(
        "INSERT INTO products (name, category, price, image_url, description, discount_percent) VALUES (?, ?, ?, ?, ?, ?)",
        [name, category, price, image_url || "", description || "", discount_percent || 0],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: "Product created" });
        }
    );
});

// UPDATE product
router.put("/:id", (req, res) => {
    const { name, category, price, image_url, description, discount_percent } = req.body;

    db.run(
        "UPDATE products SET name = ?, category = ?, price = ?, image_url = ?, description = ?, discount_percent = ? WHERE id = ?",
        [name, category, price, image_url || "", description || "", discount_percent || 0, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Product updated" });
        }
    );
});

// DELETE product
router.delete("/:id", (req, res) => {
    db.run("DELETE FROM products WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Product deleted" });
    });
});

module.exports = router;