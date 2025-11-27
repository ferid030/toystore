/**
 * Shared UI Components
 */

// Navbar Component
export function renderNavbar(user) {
    const nav = document.createElement('nav');
    nav.className = 'navbar';
    nav.innerHTML = `
        <div class="container">
            <a href="/" class="logo">Toys Market</a>
            <button class="mobile-menu-btn" style="display:none; background:none; font-size:1.5rem;">☰</button>
            <div class="nav-links">
                <a href="/" class="active">Ana Səhifə</a>
                <a href="/about.html">Haqqımızda</a>
                <a href="/contact.html">Əlaqə</a>
            </div>
            <div class="nav-actions">
                <a href="/cart.html" class="cart-icon">
                    🛒 <span class="cart-count">0</span>
                </a>
                ${user ? `
                    <a href="/profile.html" class="btn btn-sm btn-outline">Profil</a>
                    ${user.role === 'admin' ? `<a href="/admin.html" class="btn btn-sm btn-outline" style="border-color:var(--primary-color); color:var(--primary-color);">Admin</a>` : ''}
                ` : `
                    <a href="/login.html" class="btn btn-sm btn-primary">Giriş</a>
                `}
            </div>
        </div>
    `;

    // Mobile menu logic
    const btn = nav.querySelector('.mobile-menu-btn');
    const links = nav.querySelector('.nav-links');

    // Check if mobile
    if (window.innerWidth <= 768) {
        btn.style.display = 'block';
    }

    btn.addEventListener('click', () => {
        links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
    });

    return nav;
}

// Footer Component
export function renderFooter() {
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
        <div class="container">
            <div class="footer-content">
                <div>
                    <h3>Toys Market</h3>
                    <p>Uşaqlar üçün ən yaxşı oyuncaqlar.</p>
                </div>
                <div>
                    <h3>Linklər</h3>
                    <ul>
                        <li><a href="/">Ana Səhifə</a></li>
                        <li><a href="/about.html">Haqqımızda</a></li>
                        <li><a href="/contact.html">Əlaqə</a></li>
                    </ul>
                </div>
                <div>
                    <h3>Əlaqə</h3>
                    <p>Bakı, Azərbaycan</p>
                    <p>info@toysmarket.az</p>
                </div>
            </div>
            <div class="footer-bottom">
                &copy; 2023 Toys Market. Bütün hüquqlar qorunur.
            </div>
        </div>
    `;
    return footer;
}

// Loader
export const Loader = {
    show: () => {
        let overlay = document.querySelector('.loader-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'loader-overlay';
            overlay.innerHTML = '<div class="loader"></div>';
            document.body.appendChild(overlay);
        }
        setTimeout(() => overlay.classList.add('active'), 10);
    },
    hide: () => {
        const overlay = document.querySelector('.loader-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }
    }
};

// Toast Notification
export const Toast = {
    show: (message, type = 'info') => {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;font-size:1.2rem;">&times;</button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};
