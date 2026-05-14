// card.js - Standalone Card Module with Image, Info Icon, Name & Price below

(function() {
    'use strict';

    // ========== CARD CONFIGURATION ==========
    const CardConfig = {
        // Display settings
        imagePlaceholder: '🖼️',
        defaultImage: 'https://via.placeholder.com/300?text=No+Image',

        // Feature toggles
        addButtonEnabled: true,
        infoTooltipEnabled: true,
        showStock: false,  // Stock hidden, shown in tooltip only

        // Price settings
        currency: 'TSh',
        currencyPosition: 'before',

        // Card dimensions
        imageHeight: 200
    };

    // ========== HELPER FUNCTIONS ==========
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatPrice(price) {
        const formatted = Math.floor(price).toLocaleString();
        return CardConfig.currencyPosition === 'before'
            ? `${CardConfig.currency} ${formatted}`
            : `${formatted} ${CardConfig.currency}`;
    }

    function getDiscountedPrice(price, discountPercent) {
        if (!discountPercent || discountPercent <= 0) return price;
        return price - (price * discountPercent / 100);
    }

    // ========== RATING STARS ==========
    function renderStars(rating = 4.5) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHtml = '';
        for (let i = 0; i < fullStars; i++) starsHtml += '★';
        if (hasHalfStar) starsHtml += '½';
        for (let i = 0; i < emptyStars; i++) starsHtml += '☆';

        return `<span class="stars">${starsHtml}</span>`;
    }

    // ========== STOCK STATUS ==========
    function renderStockStatus(stock = 10) {
        if (stock <= 0) {
            return '<span class="stock-status out-of-stock">Out of Stock</span>';
        } else if (stock < 5) {
            return `<span class="stock-status low-stock">Only ${stock} left!</span>`;
        } else {
            return '<span class="stock-status in-stock">In Stock</span>';
        }
    }

    // ========== INFO TOOLTIP ==========
    function createInfoTooltip(product) {
        const tooltip = document.createElement('div');
        tooltip.className = 'info-tooltip';

        const discountedPrice = getDiscountedPrice(product.price, product.discount_percent);
        const hasDiscount = product.discount_percent && product.discount_percent > 0;
        const rating = product.rating || 4.5;

        tooltip.innerHTML = `
            <div class="info-tooltip-arrow"></div>
            <div class="info-tooltip-content">
                <div class="info-tooltip-header">
                    <div class="info-tooltip-title">
                        <h4>${escapeHtml(product.name)}</h4>
                    </div>
                    <div class="info-tooltip-rating">
                        ${renderStars(rating)}
                        <span>(${product.reviewCount || 24})</span>
                    </div>
                </div>
                
                <div class="info-tooltip-description">
                    <p>${escapeHtml(product.description ? product.description.substring(0, 150) : 'No description available')}${product.description && product.description.length > 150 ? '...' : ''}</p>
                </div>
                
                <div class="info-tooltip-details">
                    <div class="detail-item">
                        <span class="detail-label">📁 Category:</span>
                        <span class="detail-value">${escapeHtml(product.category)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">💰 Price:</span>
                        <span class="detail-value">
                            ${hasDiscount ?
            `<span class="tooltip-old-price">${formatPrice(product.price)}</span> 
                                 <span class="tooltip-current-price">${formatPrice(discountedPrice)}</span>` :
            `<span class="tooltip-current-price">${formatPrice(product.price)}</span>`
        }
                        </span>
                    </div>
                    ${hasDiscount ? `
                        <div class="detail-item">
                            <span class="detail-label">🎉 Discount:</span>
                            <span class="detail-value discount-text">Save ${product.discount_percent}%</span>
                        </div>
                    ` : ''}
                    <div class="detail-item">
                        <span class="detail-label">📦 Stock:</span>
                        <span class="detail-value">${product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}</span>
                    </div>
                </div>
                
                <div class="info-tooltip-footer">
                    <button class="tooltip-quick-add" data-id="${product.id}">
                        🛒 Add to Cart
                    </button>
                </div>
            </div>
        `;

        return tooltip;
    }

    // ========== MAIN CARD RENDERER ==========
    // Layout: Image with {i} on top-right, then name and price below
    function renderProductCard(product, options = {}) {
        const {
            showAddButton = CardConfig.addButtonEnabled,
            cardClass = '',
            imageHeight = CardConfig.imageHeight
        } = options;

        const discountedPrice = getDiscountedPrice(product.price, product.discount_percent);
        const hasDiscount = product.discount_percent && product.discount_percent > 0;
        const discountPercent = product.discount_percent || 0;

        return `
            <div class="product-card ${cardClass}" data-id="${product.id}" data-category="${escapeHtml(product.category)}" data-name="${escapeHtml(product.name)}" data-product='${JSON.stringify(product)}'>
                <!-- Image Section with Info Icon on Top-Right -->
                <div class="product-image" style="height: ${imageHeight}px">
                    ${product.image_url ?
            `<img src="${product.image_url}" alt="${escapeHtml(product.name)}" loading="lazy" onerror="this.src='${CardConfig.defaultImage}'">` :
            `<div class="no-image">${CardConfig.imagePlaceholder}</div>`
        }
                    ${hasDiscount ? `<div class="discount-badge-corner">-${discountPercent}%</div>` : ''}
                    
                    <!-- Info Circle Icon - Top Right corner -->
                    <div class="info-circle" data-info-trigger="${product.id}">
                        <span class="info-circle-icon">ℹ️</span>
                    </div>
                </div>
                
                <!-- Name and Price below image -->
                <div class="product-info">
                    <h3 class="product-name">${escapeHtml(product.name)}</h3>
                    <div class="product-price-wrapper">
                        ${hasDiscount ?
            `<span class="product-old-price">${formatPrice(product.price)}</span>
                             <span class="product-price">${formatPrice(discountedPrice)}</span>` :
            `<span class="product-price">${formatPrice(product.price)}</span>`
        }
                    </div>
                    
                    ${showAddButton ? `
                        <div class="card-actions">
                            <button class="add-to-cart-btn" data-id="${product.id}" data-action="addtocart">
                                <span class="btn-icon">🛒</span> Add to Cart
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // ========== ATTACH CARD EVENTS ==========
    function attachCardEvents(container, callbacks = {}) {
        if (!container) return;

        const {
            onAddToCart = null,
            onCardClick = null
        } = callbacks;

        let currentTooltip = null;
        let hoverTimeout = null;

        // Add to cart buttons
        container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = parseInt(btn.dataset.id);
                if (onAddToCart) onAddToCart(productId);

                btn.classList.add('added');
                setTimeout(() => btn.classList.remove('added'), 500);
            });
        });

        // Info circle hover tooltip
        if (CardConfig.infoTooltipEnabled) {
            container.querySelectorAll('.info-circle').forEach(infoCircle => {
                const card = infoCircle.closest('.product-card');
                const productId = parseInt(card.dataset.id);

                let product;
                try {
                    product = JSON.parse(card.dataset.product);
                } catch {
                    if (callbacks.getProductById) {
                        product = callbacks.getProductById(productId);
                    }
                }

                if (!product) return;

                infoCircle.addEventListener('mouseenter', (e) => {
                    e.stopPropagation();

                    if (hoverTimeout) clearTimeout(hoverTimeout);
                    if (currentTooltip) currentTooltip.remove();

                    currentTooltip = createInfoTooltip(product);
                    document.body.appendChild(currentTooltip);

                    const circleRect = infoCircle.getBoundingClientRect();
                    const tooltipRect = currentTooltip.getBoundingClientRect();

                    // Position to the right
                    let left = circleRect.right + 15;
                    let top = circleRect.top - (tooltipRect.height / 2) + (circleRect.height / 2);

                    if (left + tooltipRect.width > window.innerWidth - 20) {
                        left = circleRect.left - tooltipRect.width - 15;
                        currentTooltip.setAttribute('data-position', 'left');
                    } else {
                        currentTooltip.setAttribute('data-position', 'right');
                    }

                    if (top < 10) top = 10;
                    if (top + tooltipRect.height > window.innerHeight - 10) {
                        top = window.innerHeight - tooltipRect.height - 10;
                    }

                    currentTooltip.style.position = 'fixed';
                    currentTooltip.style.top = `${top}px`;
                    currentTooltip.style.left = `${left}px`;
                    currentTooltip.style.zIndex = '10001';

                    setTimeout(() => {
                        if (currentTooltip) currentTooltip.classList.add('show');
                    }, 10);

                    const quickAddBtn = currentTooltip.querySelector('.tooltip-quick-add');
                    if (quickAddBtn) {
                        quickAddBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (onAddToCart) onAddToCart(productId);
                            infoCircle.classList.add('added');
                            setTimeout(() => infoCircle.classList.remove('added'), 500);
                            if (currentTooltip) {
                                currentTooltip.classList.remove('show');
                                setTimeout(() => {
                                    if (currentTooltip) {
                                        currentTooltip.remove();
                                        currentTooltip = null;
                                    }
                                }, 200);
                            }
                        });
                    }
                });

                infoCircle.addEventListener('mouseleave', (e) => {
                    e.stopPropagation();
                    hoverTimeout = setTimeout(() => {
                        if (currentTooltip) {
                            currentTooltip.classList.remove('show');
                            setTimeout(() => {
                                if (currentTooltip && currentTooltip.parentNode) {
                                    currentTooltip.remove();
                                    currentTooltip = null;
                                }
                            }, 200);
                        }
                    }, 200);
                });
            });
        }

        // Card click
        container.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.add-to-cart-btn')) return;
                if (e.target.closest('.info-circle')) return;
                const productId = parseInt(card.dataset.id);
                if (onCardClick) onCardClick(productId);
            });
        });
    }

    // ========== COMPACT CARD ==========
    function renderCompactCard(product) {
        const discountedPrice = getDiscountedPrice(product.price, product.discount_percent);
        const hasDiscount = product.discount_percent && product.discount_percent > 0;

        return `
            <div class="compact-card" data-id="${product.id}">
                <div class="compact-image">
                    ${product.image_url ?
            `<img src="${product.image_url}" alt="${escapeHtml(product.name)}">` :
            `<div class="no-image-small">🖼️</div>`
        }
                    ${hasDiscount ? `<div class="compact-discount">-${product.discount_percent}%</div>` : ''}
                </div>
                <div class="compact-info">
                    <h4 class="compact-name">${escapeHtml(product.name)}</h4>
                    <div class="compact-price">
                        ${hasDiscount ?
            `<span class="compact-old-price">${formatPrice(product.price)}</span>
                             <span class="compact-price">${formatPrice(discountedPrice)}</span>` :
            `<span class="compact-price">${formatPrice(product.price)}</span>`
        }
                    </div>
                </div>
            </div>
        `;
    }

    // ========== MODAL RENDERER ==========
    function renderProductModal(product, options = {}) {
        const {
            onAddToCart = null,
            showRelated = false,
            relatedProducts = []
        } = options;

        const discountedPrice = getDiscountedPrice(product.price, product.discount_percent);
        const hasDiscount = product.discount_percent && product.discount_percent > 0;
        const rating = product.rating || 4.5;

        const modal = document.createElement('div');
        modal.className = 'product-modal';
        modal.setAttribute('data-product-id', product.id);
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-container">
                <button class="modal-close">&times;</button>
                <div class="modal-content-wrapper">
                    <div class="modal-image-section">
                        ${product.image_url ?
            `<img src="${product.image_url}" alt="${escapeHtml(product.name)}" onerror="this.src='${CardConfig.defaultImage}'">` :
            `<div class="no-image-large">${CardConfig.imagePlaceholder}</div>`
        }
                        ${hasDiscount ? `<div class="discount-badge-large">-${product.discount_percent}% OFF</div>` : ''}
                    </div>
                    <div class="modal-info-section">
                        <span class="modal-category">${escapeHtml(product.category)}</span>
                        <h2 class="modal-title">${escapeHtml(product.name)}</h2>
                        
                        <div class="modal-rating">
                            ${renderStars(rating)}
                            <span class="rating-count">(${product.reviewCount || 24} customer reviews)</span>
                        </div>
                        
                        <div class="modal-price-wrapper">
                            ${hasDiscount ?
            `<span class="modal-old-price">${formatPrice(product.price)}</span>
                                 <span class="modal-current-price">${formatPrice(discountedPrice)}</span>` :
            `<span class="modal-current-price">${formatPrice(product.price)}</span>`
        }
                        </div>
                        
                        <div class="modal-description">
                            <h4>Product Description</h4>
                            <p>${escapeHtml(product.description || 'No description available.')}</p>
                        </div>
                        
                        <div class="modal-actions">
                            <button class="btn-buy" data-action="addtocart">
                                <span>🛒</span> Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
                ${showRelated && relatedProducts.length > 0 ? `
                    <div class="modal-related">
                        <h3>You May Also Like</h3>
                        <div class="related-products">
                            ${relatedProducts.map(p => renderCompactCard(p)).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        return modal;
    }

    // ========== SHOW MODAL ==========
    function showProductModal(product, options = {}) {
        const modal = renderProductModal(product, options);
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        };

        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);

        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        const buyBtn = modal.querySelector('[data-action="addtocart"]');
        if (buyBtn && options.onAddToCart) {
            buyBtn.addEventListener('click', () => options.onAddToCart(product));
        }

        return modal;
    }

    // ========== SKELETON LOADER ==========
    function renderSkeletonGrid(count = 6) {
        let skeleton = '';
        for (let i = 0; i < count; i++) {
            skeleton += `
                <div class="product-card skeleton">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-info">
                        <div class="skeleton-title"></div>
                        <div class="skeleton-price"></div>
                    </div>
                </div>
            `;
        }
        return `<div class="products-grid">${skeleton}</div>`;
    }

    // ========== UPDATE CARD CONFIG ==========
    function updateCardConfig(newConfig) {
        Object.assign(CardConfig, newConfig);
    }

    // ========== EXPORT TO GLOBAL ==========
    window.ProductCard = {
        render: renderProductCard,
        renderCompact: renderCompactCard,
        renderModal: renderProductModal,
        showModal: showProductModal,
        renderSkeleton: renderSkeletonGrid,
        attachEvents: attachCardEvents,
        updateConfig: updateCardConfig,
        formatPrice: formatPrice,
        getDiscountedPrice: getDiscountedPrice,
        config: CardConfig
    };

})();