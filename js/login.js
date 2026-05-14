/**
 * Admin Login Authentication
 */

const ADMIN_PASSWORD = "admin123"; // Change this to your desired password

// Check authentication status
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem("adminLoggedIn");
    if (isLoggedIn === "true") {
        showAdminContent();
        // Initialize admin panel after login
        if (typeof initAdminPanel === 'function') {
            initAdminPanel();
        }
    } else {
        showLogin();
    }
}

// Show login screen
function showLogin() {
    const loginOverlay = document.getElementById("loginOverlay");
    const adminContent = document.getElementById("adminContent");
    if (loginOverlay) loginOverlay.style.display = "flex";
    if (adminContent) adminContent.style.display = "none";
}

// Hide login screen
function hideLogin() {
    const loginOverlay = document.getElementById("loginOverlay");
    if (loginOverlay) loginOverlay.style.display = "none";
}

// Show admin content
function showAdminContent() {
    const loginOverlay = document.getElementById("loginOverlay");
    const adminContent = document.getElementById("adminContent");
    if (loginOverlay) loginOverlay.style.display = "none";
    if (adminContent) adminContent.style.display = "block";
}

// Verify password
function verifyPassword(event) {
    event.preventDefault();
    const password = document.getElementById("adminPassword").value;
    const errorDiv = document.getElementById("loginError");

    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem("adminLoggedIn", "true");
        showAdminContent();
        errorDiv.innerHTML = "";
        document.getElementById("adminPassword").value = "";

        // Show success message
        if (typeof showNotification === 'function') {
            showNotification("✅ Access granted! Welcome to Admin Panel", "success");
        }

        // Initialize admin panel
        if (typeof initAdminPanel === 'function') {
            initAdminPanel();
        }
    } else {
        errorDiv.innerHTML = "❌ Invalid password. Please try again.";
        document.getElementById("adminPassword").value = "";
        document.getElementById("adminPassword").focus();

        // Shake animation
        const modal = document.querySelector(".login-modal");
        if (modal) {
            modal.style.animation = "shake 0.5s";
            setTimeout(() => {
                modal.style.animation = "";
            }, 500);
        }
    }
    return false;
}

// Logout function
function logout() {
    sessionStorage.removeItem("adminLoggedIn");
    showLogin();
    if (typeof showNotification === 'function') {
        showNotification("🔒 Logged out successfully", "info");
    }
}

// Show notification (if not already defined)
window.showNotification = window.showNotification || function(message, type = "info") {
    const existingNotif = document.querySelector(".notification-toast");
    if (existingNotif) existingNotif.remove();

    const notification = document.createElement("div");
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = "slideOutRight 0.3s ease";
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuth);
} else {
    checkAuth();
}