/**
 * Admin Search Functionality
 */

const searchField = document.getElementById("searchfield");

// Create admin search bar
function createAdminSearchBar() {
    if (!searchField) return;

    searchField.innerHTML = `
        <div class="search-wrapper">
            <input 
                type="text" 
                id="adminSearchInput" 
                placeholder="🔍 Search products, categories..."
                autocomplete="off"
            />
            <button id="adminSearchBtn" class="search-btn">Search</button>
        </div>
    `;

    const searchInput = document.getElementById("adminSearchInput");
    const searchBtn = document.getElementById("adminSearchBtn");

    if (searchInput) {
        // Search on input with debounce
        let debounceTimer;
        searchInput.addEventListener("input", (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                performAdminSearch(e.target.value);
            }, 500);
        });

        // Search on Enter key
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                performAdminSearch(searchInput.value);
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            performAdminSearch(searchInput.value);
        });
    }
}

// Perform admin search
function performAdminSearch(query) {
    if (!query || query.trim() === "") {
        // Reload current section
        const activeSection = document.querySelector('.nav-item.active')?.getAttribute('data-section');
        if (activeSection === 'products' && typeof loadProductsGrid === 'function') {
            loadProductsGrid();
        } else if (activeSection === 'categories' && typeof loadCategoriesGrid === 'function') {
            loadCategoriesGrid();
        }
        return;
    }

    const searchTerm = query.toLowerCase().trim();
    const activeSection = document.querySelector('.nav-item.active')?.getAttribute('data-section');

    if (activeSection === 'products') {
        searchProducts(searchTerm);
    } else if (activeSection === 'categories') {
        searchCategories(searchTerm);
    }
}

// Search products
function searchProducts(searchTerm) {
    fetch("http://localhost:3000/products")
        .then(res => res.json())
        .then(products => {
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(searchTerm) ||
                (p.description && p.description.toLowerCase().includes(searchTerm)) ||
                p.category.toLowerCase().includes(searchTerm)
            );

            displayAdminSearchResults(filtered, searchTerm, 'products');
        })
        .catch(err => console.error("Error searching products:", err));
}

// Search categories
function searchCategories(searchTerm) {
    fetch("http://localhost:3000/categories")
        .then(res => res.json())
        .then(categories => {
            const filtered = categories.filter(c =>
                c.name.toLowerCase().includes(searchTerm) ||
                (c.description && c.description.toLowerCase().includes(searchTerm))
            );

            displayAdminSearchResults(filtered, searchTerm, 'categories');
        })
        .catch(err => console.error("Error searching categories:", err));
}

// Display admin search results
function displayAdminSearchResults(items, searchTerm, type) {
    if (!items || items.length === 0) {
        customerApp.innerHTML = `
            <div class="market-box">
                <div class="top-bar">
                    <h2>Search Results</h2>
                    <p>No results found for "${escapeHtml(searchTerm)}"</p>
                </div>
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <p>Try different keywords</p>
                </div>
            </div>
        `;
        return;
    }

    if (type === 'products') {
        customerApp.innerHTML = `
            <div class="market-box">
                <div class="top-bar">
                    <h2>Search Results: "${escapeHtml(searchTerm)}"</h2>
                    <p>Found ${items.length} product${items.length !== 1 ? 's' : ''}</p>
                </div>
                <div class="admin-grid">
                    ${items.map(product => createAdminProductCard(product)).join('')}
                </div>
            </div>
        `;
    } else if (type === 'categories') {
        customerApp.innerHTML = `
            <div class="market-box">
                <div class="top-bar">
                    <h2>Search Results: "${escapeHtml(searchTerm)}"</h2>
                    <p>Found ${items.length} categor${items.length !== 1 ? 'ies' : 'y'}</p>
                </div>
                <div class="admin-grid">
                    ${items.map(category => createAdminCategoryCard(category)).join('')}
                </div>
            </div>
        `;
    }
}

// Create admin product card
function createAdminProductCard(product) {
    return `
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
                ${product.description ? `<p class="description">${escapeHtml(product.description.substring(0, 80))}...</p>` : ''}
                <div class="card-actions">
                    <button class="btn-edit" onclick="editProduct(${product.id})">✏️ Edit</button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">🗑️ Delete</button>
                </div>
            </div>
        </div>
    `;
}

// Create admin category card
function createAdminCategoryCard(category) {
    return `
        <div class="admin-card">
            <div class="card-image">
                ${category.image_url ?
        `<img src="${category.image_url}" alt="${category.name}" onerror="this.src='https://via.placeholder.com/200x200?text=No+Image'">` :
        '<div class="no-image">🏷️</div>'}
            </div>
            <div class="card-content">
                <h3>${escapeHtml(category.name)}</h3>
                ${category.description ? `<p class="description">${escapeHtml(category.description.substring(0, 80))}...</p>` : ''}
                <div class="card-actions">
                    <button class="btn-edit" onclick="editCategory(${category.id})">✏️ Edit</button>
                    <button class="btn-delete" onclick="deleteCategory(${category.id})">🗑️ Delete</button>
                </div>
            </div>
        </div>
    `;
}

// Initialize admin search
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createAdminSearchBar);
} else {
    createAdminSearchBar();
}

// Make functions global
window.performAdminSearch = performAdminSearch;
window.createAdminProductCard = createAdminProductCard;
window.createAdminCategoryCard = createAdminCategoryCard;