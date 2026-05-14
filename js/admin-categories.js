/**
 * Categories Management Module - Complete Rewrite
 * This module handles all category operations independently
 */

// Immediately invoke to ensure it loads
(function() {
    console.log("🔧 Loading Categories Module...");

    const API_BASE = "http://localhost:3000";

    // Main function to load categories view
    window.loadCategoriesGrid = function() {
        console.log("📂 Loading categories grid...");

        const app = document.getElementById("app");
        if (!app) {
            console.error("❌ App element not found!");
            return;
        }

        // Render the categories UI
        app.innerHTML = `
            <div class="market-box">
                <div class="top-bar">
                    <h2>🏷️ Manage Categories</h2>
                    <button class="btn-primary" onclick="window.showAddCategoryModal()">+ Add New Category</button>
                </div>
                <div id="categoriesListContainer">
                    <div class="loading">Loading categories...</div>
                </div>
            </div>
        `;

        // Fetch and display categories
        fetchCategories();
    };

    // Fetch categories from API
    function fetchCategories() {
        console.log("🔄 Fetching categories from API...");

        fetch(`${API_BASE}/categories`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(categories => {
                console.log("✅ Categories received:", categories);
                displayCategories(categories);
            })
            .catch(error => {
                console.error("❌ Error fetching categories:", error);
                const container = document.getElementById("categoriesListContainer");
                if (container) {
                    container.innerHTML = `
                        <div class="error-state">
                            <p>❌ Failed to load categories</p>
                            <p style="font-size: 12px;">Make sure server is running on port 3000</p>
                            <button onclick="window.loadCategoriesGrid()" class="btn-primary" style="margin-top: 10px;">Retry</button>
                        </div>
                    `;
                }
            });
    }

    // Display categories in grid
    function displayCategories(categories) {
        const container = document.getElementById("categoriesListContainer");
        if (!container) return;

        if (!categories || categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🏷️</div>
                    <p>No categories found</p>
                    <button class="btn-primary" onclick="window.showAddCategoryModal()">Add Your First Category</button>
                </div>
            `;
            return;
        }

        let html = '<div class="admin-grid">';

        categories.forEach(category => {
            const imageUrl = category.image_url || '';
            const hasImage = imageUrl && imageUrl.trim() !== '';

            html += `
                <div class="admin-card" data-category-id="${category.id}">
                    <div class="card-image">
                        ${hasImage ?
                `<img src="${imageUrl}" alt="${escapeHtml(category.name)}" onerror="this.src='https://placehold.co/400x300?text=No+Image'">` :
                '<div class="no-image">🏷️</div>'
            }
                    </div>
                    <div class="card-content">
                        <h3>${escapeHtml(category.name)}</h3>
                        ${category.description ? `<p class="description">${escapeHtml(category.description)}</p>` : '<p class="description" style="color: #999;">No description</p>'}
                        <div class="card-actions">
                            <button class="btn-edit" onclick="window.editCategoryById(${category.id})">✏️ Edit</button>
                            <button class="btn-delete" onclick="window.deleteCategoryById(${category.id})">🗑️ Delete</button>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    // Show add category modal
    window.showAddCategoryModal = function() {
        console.log("➕ Showing add category modal");

        // Remove existing modal if any
        const existingModal = document.getElementById("categoryModalGlobal");
        if (existingModal) existingModal.remove();

        const modalHtml = `
            <div id="categoryModalGlobal" class="modal" style="display: flex;">
                <div class="modal-content">
                    <span class="close" onclick="window.closeCategoryModalGlobal()">&times;</span>
                    <h3>➕ Add New Category</h3>
                    <form id="addCategoryFormGlobal" onsubmit="window.saveNewCategory(event)">
                        <div class="form-group">
                            <label>Category Name *</label>
                            <input type="text" id="catNameGlobal" required placeholder="e.g., Fruits, Vegetables, Dairy">
                        </div>
                        <div class="form-group">
                            <label>Image URL (optional)</label>
                            <input type="url" id="catImageGlobal" placeholder="https://images.unsplash.com/photo-...">
                            <small style="color: #666; display: block; margin-top: 5px;">
                                💡 Try: https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400
                            </small>
                        </div>
                        <div class="form-group">
                            <label>Description (optional)</label>
                            <textarea id="catDescGlobal" rows="3" placeholder="Describe this category..."></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">💾 Save Category</button>
                            <button type="button" class="btn-secondary" onclick="window.closeCategoryModalGlobal()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Focus on name input
        setTimeout(() => {
            const nameInput = document.getElementById("catNameGlobal");
            if (nameInput) nameInput.focus();
        }, 100);
    };

    // Save new category
    window.saveNewCategory = function(event) {
        event.preventDefault();

        const name = document.getElementById("catNameGlobal").value.trim();
        if (!name) {
            alert("❌ Category name is required");
            return;
        }

        const category = {
            name: name,
            image_url: document.getElementById("catImageGlobal").value,
            description: document.getElementById("catDescGlobal").value
        };

        console.log("Saving category:", category);

        fetch(`${API_BASE}/categories`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(category)
        })
            .then(response => response.json())
            .then(data => {
                console.log("Response:", data);
                if (data.error) {
                    alert("❌ Error: " + data.error);
                    return;
                }

                window.closeCategoryModalGlobal();
                alert("✅ Category added successfully!");
                window.loadCategoriesGrid(); // Refresh the list
            })
            .catch(error => {
                console.error("Error:", error);
                alert("❌ Error adding category. Check console for details.");
            });
    };

    // Edit category by ID
    window.editCategoryById = function(id) {
        console.log("✏️ Editing category:", id);

        fetch(`${API_BASE}/categories/${id}`)
            .then(response => response.json())
            .then(category => {
                // Remove existing modal
                const existingModal = document.getElementById("categoryModalGlobal");
                if (existingModal) existingModal.remove();

                const modalHtml = `
                    <div id="categoryModalGlobal" class="modal" style="display: flex;">
                        <div class="modal-content">
                            <span class="close" onclick="window.closeCategoryModalGlobal()">&times;</span>
                            <h3>✏️ Edit Category</h3>
                            <form id="editCategoryFormGlobal" onsubmit="window.updateExistingCategory(event)">
                                <input type="hidden" id="editCategoryId" value="${category.id}">
                                <div class="form-group">
                                    <label>Category Name *</label>
                                    <input type="text" id="editCatName" value="${escapeHtml(category.name)}" required>
                                </div>
                                <div class="form-group">
                                    <label>Image URL</label>
                                    <input type="url" id="editCatImage" value="${category.image_url || ''}" placeholder="https://images.unsplash.com/photo-...">
                                    ${category.image_url ? '<small style="color: #2ecc71;">✓ Current image URL set</small>' : ''}
                                </div>
                                <div class="form-group">
                                    <label>Description</label>
                                    <textarea id="editCatDesc" rows="3">${escapeHtml(category.description || '')}</textarea>
                                </div>
                                <div class="form-actions">
                                    <button type="submit" class="btn-primary">💾 Update Category</button>
                                    <button type="button" class="btn-secondary" onclick="window.closeCategoryModalGlobal()">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                `;

                document.body.insertAdjacentHTML('beforeend', modalHtml);
            })
            .catch(error => {
                console.error("Error loading category:", error);
                alert("❌ Failed to load category details");
            });
    };

    // Update existing category
    window.updateExistingCategory = function(event) {
        event.preventDefault();

        const id = document.getElementById("editCategoryId").value;
        const category = {
            name: document.getElementById("editCatName").value,
            image_url: document.getElementById("editCatImage").value,
            description: document.getElementById("editCatDesc").value
        };

        if (!category.name) {
            alert("❌ Category name is required");
            return;
        }

        console.log("Updating category:", id, category);

        fetch(`${API_BASE}/categories/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(category)
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert("❌ Error: " + data.error);
                    return;
                }

                window.closeCategoryModalGlobal();
                alert("✅ Category updated successfully!");
                window.loadCategoriesGrid(); // Refresh the list
            })
            .catch(error => {
                console.error("Error:", error);
                alert("❌ Error updating category");
            });
    };

    // Delete category by ID
    window.deleteCategoryById = function(id) {
        // First get category name
        fetch(`${API_BASE}/categories/${id}`)
            .then(response => response.json())
            .then(category => {
                if (confirm(`⚠️ Are you sure you want to delete category "${category.name}"?\n\nThis will NOT delete products in this category, but they will lose their category association.`)) {
                    fetch(`${API_BASE}/categories/${id}`, {
                        method: "DELETE"
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.error) {
                                alert("❌ " + data.error);
                                return;
                            }
                            alert("✅ Category deleted successfully!");
                            window.loadCategoriesGrid(); // Refresh the list
                        })
                        .catch(error => {
                            console.error("Error:", error);
                            alert("❌ Error deleting category");
                        });
                }
            });
    };

    // Close modal
    window.closeCategoryModalGlobal = function() {
        const modal = document.getElementById("categoryModalGlobal");
        if (modal) modal.remove();
    };

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

    console.log("✅ Categories module ready!");
})();