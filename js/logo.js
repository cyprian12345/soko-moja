// logo.js - Minimal version
(function() {
    const logo = document.querySelector('.logo');
    if (!logo) return;

    logo.addEventListener('click', () => {
        // Reset navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        if (document.querySelector('.nav-item')) {
            document.querySelector('.nav-item').classList.add('active');
        }

        // Clear search
        const searchInput = document.querySelector('#searchfield input');
        if (searchInput) searchInput.value = '';

        // Dispatch reset event
        window.dispatchEvent(new CustomEvent('logoReset'));

        // Scroll to top
        const app = document.getElementById('app');
        if (app) app.scrollTop = 0;
    });
})();