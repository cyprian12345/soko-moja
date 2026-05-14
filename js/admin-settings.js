/**
 * Settings Module - Complete with Currency and Discount Settings
 */

(function() {
    console.log("⚙️ Loading Settings Module...");

    // Default settings
    const DEFAULT_SETTINGS = {
        siteName: "Soko Huru Market",
        currency: "$",
        currencyPosition: "before",
        itemsPerPage: 12,
        theme: "light",
        enableNotifications: true,
        showDiscountBadge: true,
        discountLabel: "Sale"
    };

    // Main function to load settings panel
    window.loadSettingsPanel = function() {
        console.log("Loading settings panel...");

        const app = document.getElementById("app");
        if (!app) {
            console.error("App element not found");
            return;
        }

        const settings = getSettings();

        app.innerHTML = `
            <div class="market-box">
                <div class="top-bar">
                    <h2>⚙️ Settings</h2>
                </div>
                <div class="settings-container">
                    <form id="settingsForm" onsubmit="saveAllSettings(event)">
                        <!-- General Settings -->
                        <div class="settings-section">
                            <h3>General Settings</h3>
                            <div class="form-group">
                                <label>Site Name</label>
                                <input type="text" id="siteName" value="${escapeHtml(settings.siteName)}">
                            </div>
                            <div class="form-group">
                                <label>Currency Symbol</label>
                                <input type="text" id="currency" value="${settings.currency}" maxlength="5" placeholder="$">
                                <small>Examples: $, €, £, ¥, ₦, KSh, TSh</small>
                            </div>
                            <div class="form-group">
                                <label>Currency Position</label>
                                <select id="currencyPosition">
                                    <option value="before" ${settings.currencyPosition === 'before' ? 'selected' : ''}>Before amount ($10)</option>
                                    <option value="after" ${settings.currencyPosition === 'after' ? 'selected' : ''}>After amount (10$)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Items Per Page</label>
                                <select id="itemsPerPage">
                                    <option value="12" ${settings.itemsPerPage === 12 ? 'selected' : ''}>12</option>
                                    <option value="24" ${settings.itemsPerPage === 24 ? 'selected' : ''}>24</option>
                                    <option value="48" ${settings.itemsPerPage === 48 ? 'selected' : ''}>48</option>
                                    <option value="96" ${settings.itemsPerPage === 96 ? 'selected' : ''}>96</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Discount Settings -->
                        <div class="settings-section">
                            <h3>💰 Discount Settings</h3>
                            <div class="form-group checkbox">
                                <label>
                                    <input type="checkbox" id="showDiscountBadge" ${settings.showDiscountBadge ? 'checked' : ''}>
                                    Show discount badges on products
                                </label>
                            </div>
                            <div class="form-group">
                                <label>Discount Badge Label</label>
                                <input type="text" id="discountLabel" value="${settings.discountLabel}" placeholder="Sale">
                                <small>Example: "Sale", "Discount", "Special Offer"</small>
                            </div>
                            <div class="preview-box">
                                <p>Preview: <span class="discount-preview-badge">${settings.discountLabel} 🏷️</span></p>
                            </div>
                        </div>
                        
                        <!-- Appearance Settings -->
                        <div class="settings-section">
                            <h3>Appearance</h3>
                            <div class="form-group">
                                <label>Theme</label>
                                <select id="theme">
                                    <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Light</option>
                                    <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Preview Section -->
                        <div class="settings-section">
                            <h3>Preview</h3>
                            <div class="preview-box">
                                <p>Price example: <strong id="pricePreview">${formatPricePreview(9.99, settings)}</strong></p>
                                <p>Discounted price example: <strong id="discountPreview">${formatDiscountedPricePreview(9.99, 20, settings)}</strong></p>
                                <p>Site name: <strong id="sitePreview">${escapeHtml(settings.siteName)}</strong></p>
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="settings-actions">
                            <button type="submit" class="btn-primary">💾 Save Settings</button>
                            <button type="button" class="btn-secondary" onclick="resetAllSettings()">🔄 Reset to Default</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        attachPreviewListeners();
    };

    function attachPreviewListeners() {
        const currencyInput = document.getElementById("currency");
        const positionSelect = document.getElementById("currencyPosition");
        const siteNameInput = document.getElementById("siteName");
        const discountLabelInput = document.getElementById("discountLabel");

        if (currencyInput) {
            currencyInput.addEventListener('input', updatePricePreview);
            currencyInput.addEventListener('input', updateDiscountPreview);
        }
        if (positionSelect) {
            positionSelect.addEventListener('change', updatePricePreview);
            positionSelect.addEventListener('change', updateDiscountPreview);
        }
        if (siteNameInput) {
            siteNameInput.addEventListener('input', updateSitePreview);
        }
        if (discountLabelInput) {
            discountLabelInput.addEventListener('input', updateDiscountLabelPreview);
        }
    }

    function updatePricePreview() {
        const currency = document.getElementById("currency")?.value || "$";
        const position = document.getElementById("currencyPosition")?.value || "before";
        const preview = document.getElementById("pricePreview");
        if (preview) {
            preview.textContent = formatPricePreview(9.99, { currency, currencyPosition: position });
        }
    }

    function updateDiscountPreview() {
        const currency = document.getElementById("currency")?.value || "$";
        const position = document.getElementById("currencyPosition")?.value || "before";
        const preview = document.getElementById("discountPreview");
        if (preview) {
            preview.textContent = formatDiscountedPricePreview(9.99, 20, { currency, currencyPosition: position });
        }
    }

    function updateDiscountLabelPreview() {
        const label = document.getElementById("discountLabel")?.value || "Sale";
        const preview = document.querySelector(".discount-preview-badge");
        if (preview) {
            preview.textContent = label + " 🏷️";
        }
    }

    function updateSitePreview() {
        const siteName = document.getElementById("siteName")?.value || "Soko Huru Market";
        const preview = document.getElementById("sitePreview");
        if (preview) {
            preview.textContent = siteName;
        }
    }

    function formatPricePreview(price, settings) {
        if (settings.currencyPosition === 'before') {
            return `${settings.currency}${price.toFixed(2)}`;
        } else {
            return `${price.toFixed(2)}${settings.currency}`;
        }
    }

    function formatDiscountedPricePreview(price, discountPercent, settings) {
        const discountedPrice = price * (1 - discountPercent / 100);
        if (settings.currencyPosition === 'before') {
            return `${settings.currency}${discountedPrice.toFixed(2)} (${discountPercent}% off)`;
        } else {
            return `${discountedPrice.toFixed(2)}${settings.currency} (${discountPercent}% off)`;
        }
    }

    // Main formatting function - applies currency to ALL prices
    window.formatPrice = function(price, product = null) {
        const settings = getSettings();
        let displayPrice = price;
        let originalPrice = null;
        let discountPercent = null;

        if (product && product.discount_percent && product.discount_percent > 0) {
            discountPercent = product.discount_percent;
            originalPrice = price;
            displayPrice = price * (1 - discountPercent / 100);
        }

        let formattedPrice = settings.currencyPosition === 'before'
            ? `${settings.currency}${displayPrice.toFixed(2)}`
            : `${displayPrice.toFixed(2)}${settings.currency}`;

        return {
            formatted: formattedPrice,
            original: originalPrice ? (settings.currencyPosition === 'before'
                ? `${settings.currency}${originalPrice.toFixed(2)}`
                : `${originalPrice.toFixed(2)}${settings.currency}`) : null,
            discountPercent: discountPercent,
            showBadge: settings.showDiscountBadge && discountPercent > 0,
            badgeLabel: settings.discountLabel
        };
    };

    window.formatPriceSimple = function(price) {
        const settings = getSettings();
        return settings.currencyPosition === 'before'
            ? `${settings.currency}${price.toFixed(2)}`
            : `${price.toFixed(2)}${settings.currency}`;
    };

    window.getSettings = function() {
        const saved = localStorage.getItem("adminSettings");
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS };
    };

    window.saveAllSettings = function(event) {
        event.preventDefault();

        const settings = {
            siteName: document.getElementById("siteName")?.value || DEFAULT_SETTINGS.siteName,
            currency: document.getElementById("currency")?.value || DEFAULT_SETTINGS.currency,
            currencyPosition: document.getElementById("currencyPosition")?.value || DEFAULT_SETTINGS.currencyPosition,
            itemsPerPage: parseInt(document.getElementById("itemsPerPage")?.value) || DEFAULT_SETTINGS.itemsPerPage,
            theme: document.getElementById("theme")?.value || DEFAULT_SETTINGS.theme,
            enableNotifications: document.getElementById("enableNotifications")?.checked || false,
            showDiscountBadge: document.getElementById("showDiscountBadge")?.checked || false,
            discountLabel: document.getElementById("discountLabel")?.value || DEFAULT_SETTINGS.discountLabel
        };

        localStorage.setItem("adminSettings", JSON.stringify(settings));
        applyTheme(settings.theme);
        showNotification("✅ Settings saved successfully!");

        // Refresh current view to apply currency changes
        const activeSection = document.querySelector('.nav-item.active')?.getAttribute('data-section');
        if (activeSection === 'products' && typeof loadProductsGrid === 'function') {
            loadProductsGrid();
        } else if (activeSection === 'categories' && typeof loadCategoriesGrid === 'function') {
            loadCategoriesGrid();
        }
    };

    window.resetAllSettings = function() {
        if (confirm("Reset all settings to default values?")) {
            localStorage.setItem("adminSettings", JSON.stringify(DEFAULT_SETTINGS));
            window.loadSettingsPanel();
            applyTheme(DEFAULT_SETTINGS.theme);
            showNotification("🔄 Settings reset to default!");
        }
    };

    function applyTheme(theme) {
        if (theme === "dark") {
            document.body.classList.add("dark-theme");
        } else {
            document.body.classList.remove("dark-theme");
        }
    }

    function showNotification(message) {
        const existing = document.querySelector(".settings-notification");
        if (existing) existing.remove();

        const notification = document.createElement("div");
        notification.className = "settings-notification";
        notification.innerHTML = `<div class="notification-content"><span>✅</span><span>${message}</span></div>`;
        notification.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; background: #2ecc71;
            color: white; padding: 12px 20px; border-radius: 8px;
            z-index: 1000; animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = "slideOutRight 0.3s ease";
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initTheme() {
        const settings = getSettings();
        applyTheme(settings.theme);
    }

    initTheme();
    console.log("✅ Settings module ready!");
})();