/**
 * Shared UI Components - Modern & Premium Edition
 */

// Navbar Component
export function renderNavbar(user) {
    const nav = document.createElement('nav');

    // Check active path
    const path = window.location.pathname;
    const isHome = path === '/' || path === '/index.html' || path === '' || path === '/toysmarket/';

    nav.className = isHome ? 'navbar navbar-home' : 'navbar';

    nav.innerHTML = `
        <div class="container" style="display: flex; justify-content: space-between; align-items: center; position: relative;">
            <a href="/" class="logo">
                Toys Market 🎈
            </a>
            
            <div style="display:flex; align-items:center; gap:10px;">
                <div class="nav-actions" style="display: flex; align-items: center; gap: 8px;">
                    ${user ? `
                        <a href="/notifications.html" class="notification-icon" style="position:relative; font-size:1.2rem; text-decoration: none; padding: 8px; border-radius: 50%; transition: 0.3s; background: rgba(0,0,0,0.03); display: flex; align-items: center; justify-content: center;">
                            🔔 <span class="notification-count" style="display:none; position:absolute; top:-2px; right:-2px; background:var(--primary-color); color:white; font-size:0.6rem; padding:1px 4px; border-radius:10px; min-width:14px; text-align:center; font-weight:800; border: 2px solid white;">0</span>
                        </a>
                    ` : ''}
                    
                    <a href="/cart.html" class="cart-icon" style="position:relative; font-size:1.2rem; text-decoration: none; padding: 8px; border-radius: 50%; transition: 0.3s; background: rgba(0,0,0,0.03); display: flex; align-items: center; justify-content: center;">
                        🛒 <span class="cart-count" style="position:absolute; top:-2px; right:-2px; background:var(--secondary-color); color:white; font-size:0.6rem; padding:1px 4px; border-radius:10px; min-width:14px; text-align:center; font-weight:800; border: 2px solid white;">0</span>
                    </a>
                </div>
                <button class="mobile-menu-btn">☰</button>
            </div>
            
            <div class="nav-links">
                <a href="/" class="${isHome ? 'active' : ''}">Ana Səhifə</a>
                <a href="/about.html" class="${path.includes('about') ? 'active' : ''}">Haqqımızda</a>
                <a href="/buy-tocoin.html" class="${path.includes('buy-tocoin') ? 'active' : ''}" style="color:var(--primary-color) !important; font-weight:800 !important;">💰 Tocoin Al</a>
                <a href="/contact.html" class="${path.includes('contact') ? 'active' : ''}">Əlaqə</a>
                
                <div class="mobile-auth-links" style="margin-top:30px; display:none; flex-direction:column; gap:15px; width: 100%;">
                     ${user ? `
                        <a href="/profile.html" class="btn btn-outline" style="width: 100%;">👤 Profil</a>
                        ${user.role === 'admin' ? `<a href="/admin.html" class="btn btn-primary" style="width: 100%;">🛡️ Admin Panel</a>` : ''}
                    ` : `
                        <a href="/login.html" class="btn btn-primary" style="width: 100%;">Giriş Et</a>
                    `}
                </div>
            </div>
            
            <div class="desktop-only-auth" style="display: flex; align-items: center; gap: 15px;">
                ${user ? `
                    <div style="display: flex; gap: 10px;">
                        <a href="/profile.html" class="btn btn-outline" style="padding: 8px 18px; font-size: 0.9rem; font-weight: 700;">👤 Profil</a>
                        ${user.role === 'admin' ? `<a href="/admin.html" class="btn btn-primary" style="padding: 8px 18px; font-size: 0.9rem; font-weight: 700;">🛡️</a>` : ''}
                    </div>
                ` : `
                    <a href="/login.html" class="btn btn-primary" style="padding: 10px 25px; font-weight: 700;">Giriş</a>
                `}
            </div>
        </div>
    `;

    // Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('navbar-scrolled');
            if (isHome) nav.classList.remove('navbar-home');
        } else {
            nav.classList.remove('navbar-scrolled');
            if (isHome) nav.classList.add('navbar-home');
        }
    });

    // Mobile menu logic
    const btn = nav.querySelector('.mobile-menu-btn');
    const links = nav.querySelector('.nav-links');

    if (btn) {
        btn.addEventListener('click', () => {
            links.classList.toggle('active');
            btn.innerHTML = links.classList.contains('active') ? '✕' : '☰';
            document.body.style.overflow = links.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Update counts
    updateCartCount();
    if (user) updateNotificationCount();

    return nav;
}

// Update Cart Count
export function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const badges = document.querySelectorAll('.cart-count');
    badges.forEach(b => {
        b.textContent = count;
        b.style.display = count > 0 ? 'block' : 'none';
    });
}

// Update Notifications
async function updateNotificationCount() {
    try {
        const { supabase } = await import('./supabase.js');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        const badges = document.querySelectorAll('.notification-count');
        badges.forEach(b => {
            b.textContent = count;
            b.style.display = count > 0 ? 'block' : 'none';
        });
    } catch (e) { }
}

// Footer Component
export function renderFooter() {
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <h3 class="footer-logo">Toys Market 🎈</h3>
                    <p class="footer-description">Uşaqlarınızın təhlükəsizliyi və xoşbəxtliyi bizim üçün hər şeydən üstündür. Ən keyfiyyətli oyuncaqların tək ünvanı.</p>
                    <div class="social-links">
                        <a href="#" title="Instagram">📸</a>
                        <a href="#" title="Facebook">📱</a>
                        <a href="#" title="WhatsApp">💬</a>
                    </div>
                </div>
                <div class="footer-section">
                    <h4>Sürətli Keçidlər</h4>
                    <ul class="footer-links">
                        <li><a href="/">Ana Səhifə</a></li>
                        <li><a href="/about.html">Haqqımızda</a></li>
                        <li><a href="/contact.html">Əlaqə</a></li>
                        <li><a href="/buy-tocoin.html">💰 Tocoin Al</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Mağaza</h4>
                    <ul class="footer-links">
                        <li><a href="/cart.html">🛒 Səbətim</a></li>
                        <li><a href="/profile.html">👤 Profilim</a></li>
                        <li><a href="/faq.html">❓ FAQ</a></li>
                        <li><a href="/notifications.html">🔔 Bildirişlər</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Bizimlə Əlaqə</h4>
                    <div class="contact-info">
                        <p><span>📍</span> Bakı, Azərbaycan, Nizami küç. 42</p>
                        <p><span>✉️</span> abbaslif89@gmail.com</p>
                        <p><span>📞</span> +994 51 416 15 05</p>
                        <p><span>📞</span> +994 55 739 18 24</p>
                    </div>
                    <div class="payment-methods" style="margin-top: 20px; font-size: 1.5rem; display: flex; gap: 10px; opacity: 0.8;">
                        💳 🏦 💰
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 <span class="brand-name">Toys Market</span>. Bütün hüquqlar qorunur. Hazırlanıb: <span style="color:white; opacity:0.8;">Dream Team</span> ✨</p>
                <button id="back-to-top" title="Yuxarı Qayıt">↑</button>
            </div>
        </div>
    `;

    // Back to top logic
    setTimeout(() => {
        const btn = document.getElementById('back-to-top');
        if (btn) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 500) {
                    btn.classList.add('visible');
                } else {
                    btn.classList.remove('visible');
                }
            });
            btn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }, 100);

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
            <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size: 1.2rem;">${type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️')}</span>
                <span>${message}</span>
            </div>
            <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;font-size:1.5rem;color:currentColor;opacity:0.5;">&times;</button>
        `;

        container.appendChild(toast);
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(-20px)';
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }
};
