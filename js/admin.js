/**
 * Main Admin Functions - Products, Categories, Statistics
 */

const API_BASE = "http://localhost:3000";

// Load products grid
function loadProductsGrid() {
    customerApp.innerHTML = `
        <div class="market-box">
            <div class="top-bar">
                <h2>📦 Manage Products</h2>
                <button class="btn-primary" onclick="showProductForm()">+ Add New Product</button>
            </div>
            <div id="productsGrid" class="admin-grid"></div>
        </div>
    `;

    fetchProducts();
}

// Fetch and display products
function fetchProducts() {
    const productsGrid = document.getElementById("productsGrid");
    if (!productsGrid) return;

    productsGrid.innerHTML = '<div class="loading">Loading products...</div>';

    fetch(`${API_BASE}/products`)
        .then(res => res.json())
        .then(products => {
            if (products.length === 0) {
                productsGrid.innerHTML = '<div class="empty-state">No products found. Click "Add New Product" to get started.</div>';
                return;
            }

            productsGrid.innerHTML = products.map(product => `
                <div class="admin-card">
                    <div class="card-image">
                        ${product.image_url ?
                `<img src="${product.image_url}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/200x200?text=No+Image'">` :
                '<div class="no-image">📦</div>'}
                    </div>
                    <div class="card-content">
                        <h3>${escapeHtml(product.name)}</h3>
                        <p class="category">${escapeHtml(product.category)}</p>
                        <p class="price">$${product.price.toFixed(2)}</p>
                        ${product.description ? `<p class="description">${escapeHtml(product.description.substring(0, 80))}${product.description.length > 80 ? '...' : ''}</p>` : ''}
                        <div class="card-actions">
                            <button class="btn-edit" onclick="editProduct(${product.id})">✏️ Edit</button>
                            <button class="btn-delete" onclick="deleteProduct(${product.id})">🗑️ Delete</button>
                        </div>
                    </div>
                </div>
            `).join('');
        })
        .catch(err => {
            console.error("Error fetching products:", err);
            productsGrid.innerHTML = '<div class="error-state">Failed to load products</div>';
        });
}

// Load categories grid
function loadCategoriesGrid() {
    customerApp.innerHTML = `
        <div class="market-box">
            <div class="top-bar">
                <h2>🏷️ Manage Categories</h2>
                <button class="btn-primary" onclick="showCategoryForm()">+ Add New Category</button>
            </div>
            <div id="categoriesGrid" class="admin-grid"></div>
        </div>
    `;

    fetchCategories();
}

// Fetch and display categories
function fetchCategories() {
    const categoriesGrid = document.getElementById("categoriesGrid");
    if (!categoriesGrid) return;

    categoriesGrid.innerHTML = '<div class="loading">Loading categories...</div>';

    fetch(`${API_BASE}/categories`)
        .then(res => res.json())
        .then(categories => {
            if (categories.length === 0) {
                categoriesGrid.innerHTML = '<div class="empty-state">No categories found. Click "Add New Category" to get started.</div>';
                return;
            }

            categoriesGrid.innerHTML = categories.map(category => `
                <div class="admin-card">
                    <div class="card-image">
                        ${category.image_url ?
                `<img src="${category.image_url}" alt="${category.name}" onerror="this.src='https://via.placeholder.com/200x200?text=No+Image'">` :
                '<div class="no-image">🏷️</div>'}
                    </div>
                    <div class="card-content">
                        <h3>${escapeHtml(category.name)}</h3>
                        ${category.description ? `<p class="description">${escapeHtml(category.description.substring(0, 80))}${category.description.length > 80 ? '...' : ''}</p>` : ''}
                        <div class="card-actions">
                            <button class="btn-edit" onclick="editCategory(${category.id})">✏️ Edit</button>
                            <button class="btn-delete" onclick="deleteCategory(${category.id})">🗑️ Delete</button>
                        </div>
                    </div>
                </div>
            `).join('');
        })
        .catch(err => {
            console.error("Error fetching categories:", err);
            categoriesGrid.innerHTML = '<div class="error-state">Failed to load categories</div>';
        });
}

// Load statistics dashboard
function loadStatsDashboard() {
    customerApp.innerHTML = `
        <div class="market-box">
            <div class="top-bar">
                <h2>📊 Dashboard Statistics</h2>
                <p>Marketplace overview and analytics</p>
            </div>
            <div id="statsContent"></div>
        </div>
    `;

    loadStatistics();
}

// Load statistics data
function loadStatistics() {
    const statsContent = document.getElementById("statsContent");
    if (!statsContent) return;

    statsContent.innerHTML = '<div class="loading">Loading statistics...</div>';

    Promise.all([
        fetch(`${API_BASE}/products`).then(res => res.json()),
        fetch(`${API_BASE}/categories`).then(res => res.json())
    ])
        .then(([products, categories]) => {
            const totalProducts = products.length;
            const totalCategories = categories.length;
            const totalValue = products.reduce((sum, p) => sum + p.price, 0).toFixed(2);
            const avgPrice = totalProducts > 0 ? (totalValue / totalProducts).toFixed(2) : 0;

            // Category distribution
            const categoryCount = {};
            products.forEach(p => {
                categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
            });

            statsContent.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📦</div>
                    <div class="stat-value">${totalProducts}</div>
                    <div class="stat-label">Total Products</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🏷️</div>
                    <div class="stat-value">${totalCategories}</div>
                    <div class="stat-label">Total Categories</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-value">$${totalValue}</div>
                    <div class="stat-label">Total Value</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value">$${avgPrice}</div>
                    <div class="stat-label">Average Price</div>
                </div>
            </div>
            <div class="category-breakdown">
                <h3>Products by Category</h3>
                ${Object.entries(categoryCount).map(([cat, count]) => `
                    <div class="category-item">
                        <span class="category-name">${escapeHtml(cat)}</span>
                        <div class="category-bar">
                            <div class="category-bar-fill" style="width: ${(count / totalProducts) * 100}%"></div>
                        </div>
                        <span class="category-count">${count} products</span>
                    </div>
                `).join('')}
            </div>
        `;
        })
        .catch(err => {
            console.error("Error loading statistics:", err);
            statsContent.innerHTML = '<div class="error-state">Failed to load statistics</div>';
        });
}

// Product form functions
function showProductForm() {
    // Implementation from previous version
    loadCategoriesDropdown();
    // ... (keep existing product form code)
}

function editProduct(id) {
    // Implementation from previous version
}

function deleteProduct(id) {
    if (confirm("Are you sure?")) {
        fetch(`${API_BASE}/products/${id}`, { method: "DELETE" })
            .then(() => {
                loadProductsGrid();
                showNotification("Product deleted", "success");
            });
    }
}

function showCategoryForm() {
    // Implementation from previous version
}

function editCategory(id) {
    // Implementation from previous version
}

function deleteCategory(id) {
    if (confirm("Delete category?")) {
        fetch(`${API_BASE}/categories/${id}`, { method: "DELETE" })
            .then(() => {
                loadCategoriesGrid();
                showNotification("Category deleted", "success");
            })
            .catch(err => alert(err.message));
    }
}

function loadCategoriesDropdown() {
    fetch(`${API_BASE}/categories`)
        .then(res => res.json())
        .then(categories => {
            // Implementation from previous version
        });
}

// Helper functions
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Make functions global
window.loadProductsGrid = loadProductsGrid;
window.loadCategoriesGrid = loadCategoriesGrid;
window.loadStatsDashboard = loadStatsDashboard;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.showProductForm = showProductForm;
window.showCategoryForm = showCategoryForm;