// Admin Authentication - Separate file for security
const ADMIN_PASSWORD = "admin123";

function checkAuth() {
    const isLoggedIn = sessionStorage.getItem("adminLoggedIn");
    if (isLoggedIn === "true") {
        document.getElementById("loginOverlay").style.display = "none";
        document.getElementById("adminContent").style.display = "block";
        if (typeof initAdminPanel === 'function') initAdminPanel();
    } else {
        document.getElementById("loginOverlay").style.display = "flex";
        document.getElementById("adminContent").style.display = "none";
    }
}

function verifyPassword(event) {
    event.preventDefault();
    const password = document.getElementById("adminPassword").value;
    const errorDiv = document.getElementById("loginError");

    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem("adminLoggedIn", "true");
        document.getElementById("loginOverlay").style.display = "none";
        document.getElementById("adminContent").style.display = "block";
        if (typeof initAdminPanel === 'function') initAdminPanel();
        if (typeof showNotification === 'function') showNotification("✅ Access granted!", "success");
    } else {
        errorDiv.innerHTML = "❌ Invalid password";
    }
    return false;
}

function logout() {
    sessionStorage.removeItem("adminLoggedIn");
    document.getElementById("loginOverlay").style.display = "flex";
    document.getElementById("adminContent").style.display = "none";
    if (typeof showNotification === 'function') showNotification("🔒 Logged out", "info");
}

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuth);
} else {
    checkAuth();
}