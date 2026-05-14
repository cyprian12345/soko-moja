// Admin Navigation
const ADMIN_MENU = [
    { id: "products", name: "Products", icon: "📦", handler: "loadProductsGrid" },
    { id: "categories", name: "Categories", icon: "🏷️", handler: "loadCategoriesGrid" },
    { id: "stats", name: "Statistics", icon: "📊", handler: "loadStatsDashboard" },
    { id: "settings", name: "Settings", icon: "⚙️", handler: "loadSettingsPanel" }
];

function loadAdminNav() {
    const navContainer = document.getElementById("navicons");
    if (!navContainer) return;

    navContainer.innerHTML = "";

    ADMIN_MENU.forEach(item => {
        const navItem = document.createElement("div");
        navItem.className = "nav-item";
        navItem.setAttribute("data-section", item.id);
        navItem.innerHTML = `
            <div class="nav-icon">${item.icon}</div>
            <div class="nav-name">${item.name}</div>
        `;
        navItem.onclick = () => {
            console.log(`Clicked on ${item.id}`);

            // Call the appropriate function
            if (item.id === "products" && typeof window.loadProductsGrid === 'function') {
                window.loadProductsGrid();
            } else if (item.id === "categories" && typeof window.loadCategoriesGrid === 'function') {
                window.loadCategoriesGrid();
            } else if (item.id === "stats" && typeof window.loadStatsDashboard === 'function') {
                window.loadStatsDashboard();
            } else if (item.id === "settings" && typeof window.loadSettingsPanel === 'function') {
                window.loadSettingsPanel();
            } else {
                console.error(`Function for ${item.id} not found`);
            }

            // Update active state
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            navItem.classList.add('active');
        };
        navContainer.appendChild(navItem);
    });
}

function initAdminPanel() {
    console.log("Initializing admin panel...");
    loadAdminNav();
    // Load products by default
    if (typeof window.loadProductsGrid === 'function') {
        window.loadProductsGrid();
        const firstNav = document.querySelector('.nav-item');
        if (firstNav) firstNav.classList.add('active');
    }
}