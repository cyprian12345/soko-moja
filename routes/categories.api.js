const express = require("express");
const router = express.Router();
const db = require("../database/database");

// GET all categories
router.get("/", (req, res) => {
    db.all("SELECT * FROM categories ORDER BY name", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET single category
router.get("/:id", (req, res) => {
    db.get("SELECT * FROM categories WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Category not found" });
        res.json(row);
    });
});

// CREATE category
router.post("/", (req, res) => {
    const { name, image_url, description } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Category name is required" });
    }

    db.run(
        "INSERT INTO categories (name, image_url, description) VALUES (?, ?, ?)",
        [name, image_url || "", description || ""],
        function(err) {
            if (err) {
                console.error("Error creating category:", err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: this.lastID, message: "Category created successfully" });
        }
    );
});

// UPDATE category
router.put("/:id", (req, res) => {
    const { name, image_url, description } = req.body;
    const id = req.params.id;

    if (!name) {
        return res.status(400).json({ error: "Category name is required" });
    }

    db.run(
        "UPDATE categories SET name = ?, image_url = ?, description = ? WHERE id = ?",
        [name, image_url || "", description || "", id],
        function(err) {
            if (err) {
                console.error("Error updating category:", err);
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: "Category not found" });
            }
            res.json({ message: "Category updated successfully" });
        }
    );
});

// DELETE category
router.delete("/:id", (req, res) => {
    const id = req.params.id;

    // First check if category has products
    db.get("SELECT COUNT(*) as count FROM products WHERE category IN (SELECT name FROM categories WHERE id = ?)",
        [id],
        (err, row) => {
            if (err) {
                console.error("Error checking products:", err);
                return res.status(500).json({ error: err.message });
            }

            if (row.count > 0) {
                return res.status(400).json({
                    error: `Cannot delete category with ${row.count} existing products. Please reassign or delete those products first.`
                });
            }

            db.run("DELETE FROM categories WHERE id = ?", [id], function(err) {
                if (err) {
                    console.error("Error deleting category:", err);
                    return res.status(500).json({ error: err.message });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ error: "Category not found" });
                }
                res.json({ message: "Category deleted successfully" });
            });
        }
    );
});

module.exports = router;