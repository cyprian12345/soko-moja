// products.js - Fetches products from database and displays using card.js
(function() {
    'use strict';

    // API endpoint
    const PRODUCTS_URL = '/products';

    // Global state
    let allProducts = [];
    let currentCategory = null;
    let currentSearchTerm = '';
    let currentSortMethod = 'default';

    // DOM element
    const appContainer = document.getElementById('app');

    // ========== FETCH PRODUCTS ==========
    async function fetchProducts() {
        try {
            // Show skeleton loading
            if (appContainer) {
                appContainer.innerHTML = window.ProductCard.renderSkeleton(6);
            }

            console.log('Fetching products from:', PRODUCTS_URL);

            const response = await fetch(PRODUCTS_URL);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            allProducts = await response.json();
            console.log('Products loaded:', allProducts.length);

            // Add default fields for products that might be missing
            allProducts = allProducts.map(product => ({
                ...product,
                rating: product.rating || 4.5,
                reviewCount: product.reviewCount || Math.floor(Math.random() * 50) + 10,
                stock: product.stock !== undefined ? product.stock : 10
            }));

            return allProducts;
        } catch (error) {
            console.error('Error fetching products:', error);
            showErrorState('Failed to load products. Please refresh the page.');
            return [];
        }
    }

    // ========== DISPLAY PRODUCTS ==========
    function displayProducts(products) {
        if (!appContainer) return;

        if (!products || products.length === 0) {
            showEmptyState();
            return;
        }

        // Apply sorting
        let sortedProducts = [...products];
        if (currentSortMethod === 'price-asc') {
            sortedProducts.sort((a, b) => a.price - b.price);
        } else if (currentSortMethod === 'price-desc') {
            sortedProducts.sort((a, b) => b.price - a.price);
        } else if (currentSortMethod === 'name-asc') {
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        } else if (currentSortMethod === 'name-desc') {
            sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        }

        // Build sort bar HTML
        const sortBarHTML = `
            <div class="sort-bar">
                <div class="sort-info">
                    <span class="products-found">📦 ${sortedProducts.length} products found</span>
                </div>
                <div class="sort-controls">
                    <label>Sort by:</label>
                    <select id="sort-select" class="sort-select">
                        <option value="default" ${currentSortMethod === 'default' ? 'selected' : ''}>Default</option>
                        <option value="price-asc" ${currentSortMethod === 'price-asc' ? 'selected' : ''}>Price ↑ Low to High</option>
                        <option value="price-desc" ${currentSortMethod === 'price-desc' ? 'selected' : ''}>Price ↓ High to Low</option>
                        <option value="name-asc" ${currentSortMethod === 'name-asc' ? 'selected' : ''}>Name A → Z</option>
                        <option value="name-desc" ${currentSortMethod === 'name-desc' ? 'selected' : ''}>Name Z → A</option>
                    </select>
                </div>
            </div>
            <div class="products-grid" id="products-grid"></div>
        `;

        appContainer.innerHTML = sortBarHTML;

        // Render each product card using card.js
        const gridContainer = document.getElementById('products-grid');
        if (gridContainer) {
            sortedProducts.forEach(product => {
                const cardHtml = window.ProductCard.render(product, {
                    showAddButton: true,
                    showRating: true,
                    showStock: true,
                    showDescription: true,
                    descriptionLength: 80,
                    imageHeight: 220
                });
                gridContainer.insertAdjacentHTML('beforeend', cardHtml);
            });
        }

        // Attach all card events (including hover tooltip)
        window.ProductCard.attachEvents(appContainer, {
            onAddToCart: (productId) => handleAddToCart(productId),
            onCardClick: (productId) => {
                const product = allProducts.find(p => p.id === productId);
                if (product) {
                    window.ProductCard.showModal(product, {
                        onAddToCart: (p) => handleAddToCart(p.id)
                    });
                }
            },
            getProductById: (productId) => {
                return allProducts.find(p => p.id === productId);
            }
        });

        // Sort event listener
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                currentSortMethod = e.target.value;
                applyFiltersAndDisplay();
            });
        }
    }

    // ========== HANDLE ADD TO CART ==========
    function handleAddToCart(productId) {
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            console.log('Added to cart:', product.name);
            showNotification(`🛒 Added "${product.name}" to cart!`);

            // You can implement actual cart logic here
            // For example: save to localStorage, update cart count, etc.
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingItem = cart.find(item => item.id === productId);

            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 1) + 1;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    discount_percent: product.discount_percent,
                    image_url: product.image_url,
                    quantity: 1
                });
            }

            localStorage.setItem('cart', JSON.stringify(cart));

            // Dispatch cart update event
            window.dispatchEvent(new CustomEvent('cartUpdated', {
                detail: { cartCount: cart.length }
            }));
        }
    }

    // ========== SHOW NOTIFICATION ==========
    function showNotification(message, type = 'success') {
        // Remove existing notification
        const existingNotification = document.querySelector('.cart-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `cart-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-weight: 500;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 2000);
    }

    // ========== FILTER FUNCTIONS ==========
    function applyFiltersAndDisplay() {
        let filtered = [...allProducts];

        // Apply category filter
        if (currentCategory) {
            filtered = filtered.filter(product => product.category === currentCategory);
        }

        // Apply search filter
        if (currentSearchTerm) {
            const term = currentSearchTerm.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(term) ||
                (product.description && product.description.toLowerCase().includes(term)) ||
                product.category.toLowerCase().includes(term)
            );
        }

        displayProducts(filtered);
    }

    function filterByCategory(categoryName) {
        currentCategory = categoryName;
        applyFiltersAndDisplay();
    }

    function searchProducts(searchTerm) {
        currentSearchTerm = searchTerm;
        applyFiltersAndDisplay();
    }

    function resetProducts() {
        currentCategory = null;
        currentSearchTerm = '';
        currentSortMethod = 'default';
        applyFiltersAndDisplay();

        // Update active state in navigation (remove category highlight)
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.getAttribute('data-category-name') === 'All') {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // ========== UI STATE FUNCTIONS ==========
    function showEmptyState() {
        if (appContainer) {
            appContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🛍️</div>
                    <h3>No products found</h3>
                    <p>Try adjusting your search or browse our categories</p>
                    <div class="empty-suggestion">Check back soon for new arrivals!</div>
                </div>
            `;
        }
    }

    function showErrorState(message) {
        if (appContainer) {
            appContainer.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <p>${message}</p>
                    <button class="retry-btn" onclick="location.reload()">Retry</button>
                </div>
            `;
        }
    }

    // ========== EVENT LISTENERS ==========
    function setupEventListeners() {
        // Listen for category selection from nav.js
        window.addEventListener('categorySelected', (event) => {
            filterByCategory(event.detail.categoryName);
        });

        // Listen for search from search.js
        window.addEventListener('searchPerformed', (event) => {
            searchProducts(event.detail.searchTerm);
        });

        // Listen for logo reset from logo.js
        window.addEventListener('logoReset', () => {
            resetProducts();
        });
    }

    // ========== ADD CSS ANIMATIONS ==========
    function addNotificationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .cart-notification {
                cursor: pointer;
                transition: transform 0.2s ease;
            }
            
            .cart-notification:hover {
                transform: scale(1.05);
            }
        `;
        document.head.appendChild(style);
    }

    // ========== EXPORT GLOBAL FUNCTIONS ==========
    window.filterByCategory = filterByCategory;
    window.searchProducts = searchProducts;
    window.resetProducts = resetProducts;
    window.getAllProducts = () => allProducts;

    // ========== INITIALIZATION ==========
    async function initProducts() {
        addNotificationStyles();
        setupEventListeners();
        await fetchProducts();
        applyFiltersAndDisplay();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProducts);
    } else {
        initProducts();
    }
})();