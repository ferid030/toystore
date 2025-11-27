import { supabase } from './supabase.js';
import { renderNavbar, renderFooter, Loader, Toast } from './components.js';
import { getCurrentUser } from './auth.js';
import { Cart } from './cart.js';

async function init() {
    const user = await getCurrentUser();
    document.getElementById('app').innerHTML = '';
    document.getElementById('app').appendChild(renderNavbar(user));

    await loadToys();

    const footer = renderFooter();
    document.body.appendChild(footer);

    Cart.updateCount();
}

async function loadToys() {
    const { data: toys, error } = await supabase
        .from('toys')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        Toast.show('Xəta baş verdi: ' + error.message, 'error');
        return;
    }

    const container = document.getElementById('products-container');

    if (toys.length === 0) {
        container.innerHTML = '<p class="text-center" style="grid-column: 1/-1; color: #718096;">Hal-hazırda məhsul yoxdur.</p>';
        return;
    }

    container.innerHTML = toys.map((toy, index) => `
        <div class="product-card" style="animation-delay: ${index * 0.1}s;">
            ${toy.discount ? `<div class="product-badge">-${toy.discount}%</div>` : ''}
            <a href="/product.html?id=${toy.id}" style="text-decoration:none; color:inherit;">
                <img src="${toy.image_url || 'https://placehold.co/400x300?text=Oyuncaq'}" 
                     alt="${toy.name}" 
                     class="product-image">
                <div class="product-info">
                    <div class="product-name">${toy.name}</div>
                    <div class="product-price">${toy.price_azn} AZN</div>
                    ${toy.tocoin_price ? `<div style="color: #f5576c; font-weight: 600; font-size: 0.95rem; margin-bottom: 1rem;">💰 ${toy.tocoin_price} Tocoin</div>` : ''}
                </div>
            </a>
            <div style="padding: 0 1.5rem 1.5rem;">
                <button class="add-to-cart-btn" data-id="${toy.id}">
                    🛒 Səbətə Əlavə Et
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners for cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const currentUser = await getCurrentUser();

            if (!currentUser) {
                Toast.show('Səbətə əlavə etmək üçün daxil olun', 'error');
                setTimeout(() => window.location.href = '/login.html', 1500);
                return;
            }

            const id = e.target.dataset.id;
            const toy = toys.find(t => t.id === id);
            Cart.add(toy);

            // Button animation
            e.target.textContent = '✓ Əlavə Edildi';
            e.target.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
            setTimeout(() => {
                e.target.textContent = '🛒 Səbətə Əlavə Et';
                e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }, 2000);
        });
    });

    // Smooth scroll for hero button
    document.querySelector('.hero-btn-primary')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    });
}

init();
