/**
 * Statistics Module - Simplified to show only product statistics
 */

(function() {
    console.log("📊 Loading Statistics Module...");

    const API_BASE = "http://localhost:3000";

    // Main function to load statistics view
    window.loadStatsDashboard = function() {
        console.log("Loading statistics dashboard...");

        const app = document.getElementById("app");
        if (!app) {
            console.error("App element not found");
            return;
        }

        app.innerHTML = `
            <div class="market-box">
                <div class="top-bar">
                    <h2>📊 Product Statistics</h2>
                </div>
                <div id="statsContainer">
                    <div class="loading">Loading statistics...</div>
                </div>
            </div>
        `;

        fetchProductStatistics();
    };

    // Fetch product statistics
    function fetchProductStatistics() {
        fetch(`${API_BASE}/products`)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then(products => {
                displayStatistics(products);
            })
            .catch(error => {
                console.error("Error fetching products:", error);
                const container = document.getElementById("statsContainer");
                if (container) {
                    container.innerHTML = `
                        <div class="error-state">
                            <p>❌ Failed to load statistics</p>
                            <button onclick="window.loadStatsDashboard()" class="btn-primary" style="margin-top: 10px;">Retry</button>
                        </div>
                    `;
                }
            });
    }

    // Display statistics
    function displayStatistics(products) {
        const container = document.getElementById("statsContainer");
        if (!container) return;

        // Calculate statistics
        const totalProducts = products.length;
        const totalValue = products.reduce((sum, p) => sum + p.price, 0).toFixed(2);
        const averagePrice = totalProducts > 0 ? (totalValue / totalProducts).toFixed(2) : 0;
        const minPrice = totalProducts > 0 ? Math.min(...products.map(p => p.price)).toFixed(2) : 0;
        const maxPrice = totalProducts > 0 ? Math.max(...products.map(p => p.price)).toFixed(2) : 0;

        // Get currency symbol from settings
        const settings = getSettings();
        const currency = settings.currency || "$";

        // Group products by category
        const categoryCount = {};
        products.forEach(p => {
            categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
        });

        // Sort categories by count
        const sortedCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);

        container.innerHTML = `
            <div class="stats-simple">
                <!-- Main Stats Cards -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">📦</div>
                        <div class="stat-value">${totalProducts}</div>
                        <div class="stat-label">Total Products</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-value">${currency}${totalValue}</div>
                        <div class="stat-label">Total Value</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-value">${currency}${averagePrice}</div>
                        <div class="stat-label">Average Price</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⬇️</div>
                        <div class="stat-value">${currency}${minPrice}</div>
                        <div class="stat-label">Lowest Price</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⬆️</div>
                        <div class="stat-value">${currency}${maxPrice}</div>
                        <div class="stat-label">Highest Price</div>
                    </div>
                </div>
                
                <!-- Products by Category -->
                <div class="category-breakdown">
                    <h3>Products by Category</h3>
                    ${sortedCategories.length > 0 ? `
                        <div class="category-list">
                            ${sortedCategories.map(([cat, count]) => `
                                <div class="category-item">
                                    <span class="category-name">${escapeHtml(cat)}</span>
                                    <div class="category-bar">
                                        <div class="category-bar-fill" style="width: ${(count / totalProducts) * 100}%"></div>
                                    </div>
                                    <span class="category-count">${count} product${count !== 1 ? 's' : ''}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p class="no-data">No products in any category</p>'}
                </div>
                
                <!-- Price Range Distribution -->
                <div class="price-distribution">
                    <h3>Price Distribution</h3>
                    ${generatePriceDistribution(products, currency)}
                </div>
            </div>
        `;
    }

    // Generate price distribution chart
    function generatePriceDistribution(products, currency) {
        if (products.length === 0) return '<p class="no-data">No products to analyze</p>';

        const ranges = [
            { label: "Under $10", min: 0, max: 10, count: 0 },
            { label: "$10 - $25", min: 10, max: 25, count: 0 },
            { label: "$25 - $50", min: 25, max: 50, count: 0 },
            { label: "$50 - $100", min: 50, max: 100, count: 0 },
            { label: "Over $100", min: 100, max: Infinity, count: 0 }
        ];

        products.forEach(product => {
            const price = product.price;
            for (let range of ranges) {
                if (price >= range.min && price < range.max) {
                    range.count++;
                    break;
                }
            }
        });

        const maxCount = Math.max(...ranges.map(r => r.count));

        return `
            <div class="price-ranges">
                ${ranges.map(range => `
                    <div class="price-range-item">
                        <span class="range-label">${range.label}</span>
                        <div class="range-bar-container">
                            <div class="range-bar" style="width: ${maxCount > 0 ? (range.count / maxCount) * 100 : 0}%">
                                <span class="range-count">${range.count}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Get settings from localStorage
    function getSettings() {
        const defaultSettings = {
            siteName: "Soko Huru Market",
            currency: "$",
            itemsPerPage: 12,
            theme: "light"
        };

        const saved = localStorage.getItem("adminSettings");
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    // Escape HTML helper
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    console.log("✅ Statistics module ready!");
})();