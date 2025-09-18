function createMenu() {
    const menuItems = [
        { text: 'Clases', url: 'index.html' },
        { text: 'Trabajo Práctico', url: 'trabajopractico.html' },
        { text: 'Mapa de Herramientas', url: 'mapadeherramientas.html' }
    ];

    const nav = document.createElement('nav');
    nav.className = 'main-nav';

    menuItems.forEach(item => {
        const link = document.createElement('a');
        link.href = item.url;
        link.className = 'nav-link';
        link.textContent = item.text;
        
        // Highlight current page
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        if (currentPath === item.url) {
            link.classList.add('active');
        }
        
        nav.appendChild(link);
    });

    return nav;
}

function initMenu() {
    const headerContainer = document.querySelector('header .container');
    if (!headerContainer) return;

    const existingNav = headerContainer.querySelector('.main-nav');
    if (existingNav) {
        existingNav.remove();
    }

    headerContainer.appendChild(createMenu());
}

// Initialize menu when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMenu);
} else {
    initMenu();
}
