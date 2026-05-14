const express = require("express");
const cors = require("cors");
const path = require("path");

const productsAPI = require("./routes/products.api");
const categoriesAPI = require("./routes/categories.api");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   API ROUTES
========================= */
app.use("/products", productsAPI);
app.use("/categories", categoriesAPI);

/* =========================
   STATIC FILES (FRONTEND)
========================= */

// This tells Express to serve your HTML/CSS/JS files
app.use(express.static(__dirname));

/* =========================
   HOME ROUTE (optional but nice)
========================= */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

/* =========================
   START SERVER
========================= */
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});