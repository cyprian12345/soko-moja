// nav.js - Fetches categories from database via API with "All Products" option
(function() {
    'use strict';

    // API endpoint - matches your server.js (no /api prefix)
    const CATEGORIES_URL = '/categories';

    async function fetchCategories() {
        try {
            console.log('Fetching categories from:', CATEGORIES_URL);
            const response = await fetch(CATEGORIES_URL);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const categories = await response.json();
            console.log('Categories loaded:', categories);
            return categories;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    function renderNavigation(categories) {
        const navContainer = document.getElementById('navicons');
        if (!navContainer) {
            console.error('Nav container #navicons not found');
            return;
        }

        navContainer.innerHTML = '';

        // Create "All Products" category FIRST
        const allProductsItem = document.createElement('div');
        allProductsItem.className = 'nav-item';
        allProductsItem.setAttribute('data-category-id', 'all');
        allProductsItem.setAttribute('data-category-name', 'All');

        allProductsItem.innerHTML = `
            <div class="nav-placeholder">🛍️</div>
            <div class="nav-name">All</div>
        `;

        allProductsItem.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            allProductsItem.classList.add('active');

            // Dispatch event to show all products
            window.dispatchEvent(new CustomEvent('categorySelected', {
                detail: {
                    categoryId: 'all',
                    categoryName: null  // null means show all products
                }
            }));
        });

        navContainer.appendChild(allProductsItem);

        // If no categories from database, show message
        if (!categories || categories.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-nav';
            emptyMsg.innerHTML = `
                <div class="nav-placeholder">📁</div>
                <div class="nav-name">No Categories</div>
            `;
            navContainer.appendChild(emptyMsg);
            return;
        }

        // Render each category from database
        categories.forEach(category => {
            const navItem = document.createElement('div');
            navItem.className = 'nav-item';
            navItem.setAttribute('data-category-id', category.id);
            navItem.setAttribute('data-category-name', category.name);

            let imageHtml = '';
            if (category.image_url && category.image_url !== '') {
                imageHtml = `<img src="${category.image_url}" alt="${escapeHtml(category.name)}" class="nav-image" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'nav-placeholder\\'>📦</div>'">`;
            } else {
                imageHtml = `<div class="nav-placeholder">📦</div>`;
            }

            navItem.innerHTML = `
                ${imageHtml}
                <div class="nav-name">${escapeHtml(category.name)}</div>
            `;

            navItem.addEventListener('click', () => {
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                navItem.classList.add('active');

                // Dispatch event for products.js with category name
                window.dispatchEvent(new CustomEvent('categorySelected', {
                    detail: {
                        categoryId: category.id,
                        categoryName: category.name
                    }
                }));
            });

            navContainer.appendChild(navItem);
        });

        // Set "All Products" as active by default
        allProductsItem.classList.add('active');
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function showLoadingState() {
        const navContainer = document.getElementById('navicons');
        if (navContainer) {
            navContainer.innerHTML = `
                <div class="loading-nav">
                    <div class="loading-spinner-small"></div>
                    <div class="nav-name">Loading...</div>
                </div>
            `;
        }
    }

    async function initNavigation() {
        showLoadingState();
        const categories = await fetchCategories();
        renderNavigation(categories);
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavigation);
    } else {
        initNavigation();
    }
})();