/**
 * Products Management - Complete with Discount and Currency Support
 */

(function() {
    console.log("📦 Loading Products Module...");

    const API_BASE = "http://localhost:3000";

    window.loadProductsGrid = function() {
        console.log("Loading products grid...");

        const app = document.getElementById("app");
        if (!app) return;

        app.innerHTML = `
            <div class="market-box">
                <div class="top-bar">
                    <h2>📦 Manage Products</h2>
                    <button class="btn-primary" onclick="showAddProductForm()">+ Add New Product</button>
                </div>
                <div id="productsListContainer">
                    <div class="loading">Loading products...</div>
                </div>
            </div>
        `;

        fetchAllProducts();
    };

    function fetchAllProducts() {
        fetch(`${API_BASE}/products`)
            .then(res => res.json())
            .then(products => {
                displayProducts(products);
            })
            .catch(error => {
                console.error("Error:", error);
                const container = document.getElementById("productsListContainer");
                if (container) {
                    container.innerHTML = `<div class="error-state">Failed to load products. Make sure server is running.</div>`;
                }
            });
    }

    function displayProducts(products) {
        const container = document.getElementById("productsListContainer");
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = `<div class="empty-state">No products found. Click "Add New Product" to get started.</div>`;
            return;
        }

        let html = '<div class="admin-grid">';
        products.forEach(product => {
            const priceInfo = window.formatPrice ? window.formatPrice(product.price, product) : {
                formatted: `$${product.price.toFixed(2)}`,
                original: null,
                discountPercent: product.discount_percent || 0,
                showBadge: false,
                badgeLabel: "Sale"
            };

            const imageUrl = product.image_url || '';
            const hasImage = imageUrl && imageUrl.trim() !== '';

            html += `
                <div class="admin-card">
                    <div class="card-image" style="position: relative;">
                        ${hasImage ?
                `<img src="${imageUrl}" alt="${escapeHtml(product.name)}" onerror="this.src='https://placehold.co/400x300?text=No+Image'">` :
                '<div class="no-image">📦</div>'}
                        ${priceInfo.showBadge ? `<span class="discount-badge">${priceInfo.badgeLabel} ${priceInfo.discountPercent}% OFF</span>` : ''}
                    </div>
                    <div class="card-content">
                        <h3>${escapeHtml(product.name)}</h3>
                        <p class="category">📁 ${escapeHtml(product.category)}</p>
                        <div class="price-container">
                            ${priceInfo.original ?
                `<span class="old-price">${priceInfo.original}</span>
                                 <span class="current-price">${priceInfo.formatted}</span>` :
                `<span class="current-price">${priceInfo.formatted}</span>`
            }
                        </div>
                        ${product.description ? `<p class="description">📝 ${escapeHtml(product.description)}</p>` : ''}
                        <div class="card-actions">
                            <button class="btn-edit" onclick="editProductById(${product.id})">✏️ Edit</button>
                            <button class="btn-delete" onclick="deleteProductById(${product.id})">🗑️ Delete</button>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    window.showAddProductForm = function() {
        fetch(`${API_BASE}/categories`)
            .then(res => res.json())
            .then(categories => {
                const categoryOptions = categories.map(cat =>
                    `<option value="${escapeHtml(cat.name)}">${escapeHtml(cat.name)}</option>`
                ).join('');

                const modalHtml = `
                    <div id="productModal" class="modal" style="display: flex;">
                        <div class="modal-content">
                            <span class="close" onclick="closeProductModal()">&times;</span>
                            <h3>➕ Add New Product</h3>
                            <form onsubmit="saveNewProduct(event)">
                                <div class="form-group">
                                    <label>Product Name *</label>
                                    <input type="text" id="prodName" required>
                                </div>
                                <div class="form-group">
                                    <label>Category *</label>
                                    <select id="prodCategory" required>
                                        <option value="">Select Category</option>
                                        ${categoryOptions}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Original Price *</label>
                                    <input type="number" step="0.01" id="prodPrice" required>
                                </div>
                                <div class="form-group">
                                    <label>Discount Percentage (%)</label>
                                    <input type="number" step="1" id="prodDiscount" value="0" min="0" max="100">
                                    <small>Leave 0 for no discount</small>
                                </div>
                                <div class="form-group">
                                    <label>Image URL</label>
                                    <input type="url" id="prodImage" placeholder="https://images.unsplash.com/photo-...">
                                </div>
                                <div class="form-group">
                                    <label>Description</label>
                                    <textarea id="prodDescription" rows="3"></textarea>
                                </div>
                                <div class="form-actions">
                                    <button type="submit" class="btn-primary">💾 Save Product</button>
                                    <button type="button" class="btn-secondary" onclick="closeProductModal()">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                `;

                const existing = document.getElementById("productModal");
                if (existing) existing.remove();
                document.body.insertAdjacentHTML('beforeend', modalHtml);
            });
    };

    window.saveNewProduct = function(event) {
        event.preventDefault();

        const product = {
            name: document.getElementById("prodName").value,
            category: document.getElementById("prodCategory").value,
            price: parseFloat(document.getElementById("prodPrice").value),
            discount_percent: parseFloat(document.getElementById("prodDiscount").value) || 0,
            image_url: document.getElementById("prodImage").value,
            description: document.getElementById("prodDescription").value
        };

        fetch(`${API_BASE}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product)
        })
            .then(res => res.json())
            .then(() => {
                closeProductModal();
                window.loadProductsGrid();
                alert("✅ Product added successfully!");
            })
            .catch(err => alert("❌ Error: " + err));
    };

    window.editProductById = function(id) {
        Promise.all([
            fetch(`${API_BASE}/products/${id}`).then(r => r.json()),
            fetch(`${API_BASE}/categories`).then(r => r.json())
        ]).then(([product, categories]) => {
            const categoryOptions = categories.map(cat =>
                `<option value="${escapeHtml(cat.name)}" ${cat.name === product.category ? 'selected' : ''}>${escapeHtml(cat.name)}</option>`
            ).join('');

            const modalHtml = `
                <div id="productModal" class="modal" style="display: flex;">
                    <div class="modal-content">
                        <span class="close" onclick="closeProductModal()">&times;</span>
                        <h3>✏️ Edit Product</h3>
                        <form onsubmit="updateExistingProduct(event)">
                            <input type="hidden" id="productId" value="${product.id}">
                            <div class="form-group">
                                <label>Product Name *</label>
                                <input type="text" id="prodName" value="${escapeHtml(product.name)}" required>
                            </div>
                            <div class="form-group">
                                <label>Category *</label>
                                <select id="prodCategory" required>
                                    ${categoryOptions}
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Original Price *</label>
                                <input type="number" step="0.01" id="prodPrice" value="${product.price}" required>
                            </div>
                            <div class="form-group">
                                <label>Discount Percentage (%)</label>
                                <input type="number" step="1" id="prodDiscount" value="${product.discount_percent || 0}" min="0" max="100">
                            </div>
                            <div class="form-group">
                                <label>Image URL</label>
                                <input type="url" id="prodImage" value="${product.image_url || ''}">
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea id="prodDescription" rows="3">${escapeHtml(product.description || '')}</textarea>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn-primary">💾 Update Product</button>
                                <button type="button" class="btn-secondary" onclick="closeProductModal()">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            const existing = document.getElementById("productModal");
            if (existing) existing.remove();
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        });
    };

    window.updateExistingProduct = function(event) {
        event.preventDefault();

        const id = document.getElementById("productId").value;
        const product = {
            name: document.getElementById("prodName").value,
            category: document.getElementById("prodCategory").value,
            price: parseFloat(document.getElementById("prodPrice").value),
            discount_percent: parseFloat(document.getElementById("prodDiscount").value) || 0,
            image_url: document.getElementById("prodImage").value,
            description: document.getElementById("prodDescription").value
        };

        fetch(`${API_BASE}/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product)
        })
            .then(res => res.json())
            .then(() => {
                closeProductModal();
                window.loadProductsGrid();
                alert("✅ Product updated successfully!");
            })
            .catch(err => alert("❌ Error: " + err));
    };

    window.deleteProductById = function(id) {
        if (confirm("Are you sure you want to delete this product?")) {
            fetch(`${API_BASE}/products/${id}`, { method: "DELETE" })
                .then(() => {
                    window.loadProductsGrid();
                    alert("✅ Product deleted!");
                });
        }
    };

    window.closeProductModal = function() {
        const modal = document.getElementById("productModal");
        if (modal) modal.remove();
    };

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    console.log("✅ Products module ready!");
})();