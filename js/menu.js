function createMenu() {
    const menuItems = [
        { text: 'Clases', url: 'index.html' },
        { text: 'Trabajo Práctico', url: 'trabajopractico.html' },
        { text: 'Mapa de Herramientas', url: 'mapadeherramientas.html' },
        { text: 'Tutoriales', url: 'tutoriales.html' },
        { text: 'Prompting', url: 'prompting.html' },
        { text: 'Protocolo de Revisión', url: 'protocolo-revision.html' }
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
    const header = document.querySelector('header');
    const headerContainer = document.querySelector('header .container');
    if (!headerContainer) return;

    const existingNav = headerContainer.querySelector('.main-nav');
    if (existingNav) {
        existingNav.remove();
    }

    const existingToggle = headerContainer.querySelector('.menu-toggle');
    if (existingToggle) {
        existingToggle.remove();
    }

    // Create hamburger button
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '☰';
    menuToggle.setAttribute('aria-label', 'Toggle menu');
    
    const menu = createMenu();
    
    // Add toggle functionality
    menuToggle.addEventListener('click', () => {
        menu.classList.toggle('active');
    });

    // Check if it's a compact header (like in mapadeherramientas.html)
    const headerContent = headerContainer.querySelector('.header-content');
    if (headerContent) {
        headerContent.appendChild(menuToggle);
        headerContent.appendChild(menu);
    } else {
        headerContainer.appendChild(menuToggle);
        headerContainer.appendChild(menu);
    }
}

// Initialize menu when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMenu);
} else {
    initMenu();
}
