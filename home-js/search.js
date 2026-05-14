// search.js - Search functionality with secret code to admin
(function() {
    'use strict';

    let searchInput = null;
    let searchButton = null;
    let debounceTimer = null;

    // Secret code variables
    const SECRET_KEYWORD = 'sokohuru'; // Type this in search to go to admin

    function createSearchField() {
        return `
            <div class="search-wrapper">
                <input type="text" 
                       id="search-input" 
                       placeholder="🔍 Search products... (type 'sokohuru' for admin)" 
                       autocomplete="off">
                <button id="search-btn" class="search-btn">Search</button>
                <button id="clear-search-btn" class="clear-btn" style="display: none;">✖</button>
            </div>
        `;
    }

    // Check for secret code and redirect to admin
    function checkSecretCode(value) {
        if (value.toLowerCase().includes(SECRET_KEYWORD)) {
            // Show admin access notification
            showAdminNotification();

            // Redirect to admin page after 1 second
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);

            return true;
        }
        return false;
    }

    // Show admin access notification
    function showAdminNotification() {
        // Remove existing notification
        const existing = document.querySelector('.admin-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'admin-notification';
        notification.innerHTML = `
            <div class="admin-content">
                <span class="admin-icon">👑</span>
                <span class="admin-message">Admin Access Granted! Redirecting...</span>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 40px;
            border-radius: 12px;
            font-size: 18px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            animation: adminGlow 0.5s ease, slideDown 0.3s ease;
            text-align: center;
            min-width: 320px;
        `;

        document.body.appendChild(notification);
    }

    function performSearch(searchTerm) {
        // Check for secret code first
        if (checkSecretCode(searchTerm)) {
            return;
        }

        // Normal search
        window.dispatchEvent(new CustomEvent('searchPerformed', {
            detail: { searchTerm: searchTerm.trim() }
        }));
    }

    function handleSearchInput(value) {
        if (debounceTimer) clearTimeout(debounceTimer);

        const clearButton = document.getElementById('clear-search-btn');
        if (clearButton) {
            clearButton.style.display = value.length > 0 ? 'block' : 'none';
        }

        debounceTimer = setTimeout(() => {
            performSearch(value);
        }, 300);
    }

    function clearSearch() {
        if (searchInput) {
            searchInput.value = '';
            performSearch('');
            searchInput.focus();
        }
    }

    function initSearchField() {
        const searchContainer = document.getElementById('searchfield');
        if (!searchContainer) return;

        searchContainer.innerHTML = createSearchField();

        searchInput = document.getElementById('search-input');
        searchButton = document.getElementById('search-btn');
        const clearButton = document.getElementById('clear-search-btn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => handleSearchInput(e.target.value));
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') performSearch(searchInput.value);
            });
        }

        if (searchButton) {
            searchButton.addEventListener('click', () => performSearch(searchInput.value));
        }

        if (clearButton) {
            clearButton.addEventListener('click', clearSearch);
        }
    }

    // Add CSS animations
    function addSecretStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes adminGlow {
                0%, 100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
                50% { box-shadow: 0 0 20px 10px rgba(102, 126, 234, 0.7); }
            }
            @keyframes slideDown {
                from { transform: translate(-50%, -50%) translateY(-50px); opacity: 0; }
                to { transform: translate(-50%, -50%) translateY(0); opacity: 1; }
            }
            .admin-content {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            .admin-icon {
                font-size: 32px;
                animation: spin 0.5s ease;
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    window.clearSearch = clearSearch;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initSearchField();
            addSecretStyles();
        });
    } else {
        initSearchField();
        addSecretStyles();
    }

    window.addEventListener('logoReset', () => clearSearch());
})();