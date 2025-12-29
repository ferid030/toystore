import { supabase } from './supabase.js';
import { renderNavbar, renderFooter, Loader, Toast } from './components.js';
import { getCurrentUser } from './auth.js';
import { Cart } from './cart.js';
import { reveal, initPreloader, initHeroParallax } from './animations.js';

async function init() {
    initPreloader();

    const user = await getCurrentUser();
    document.getElementById('app').innerHTML = '';
    document.getElementById('app').appendChild(renderNavbar(user));

    await loadToys();

    initHeroParallax();
    window.addEventListener("scroll", reveal);
    reveal(); // Initial check

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
        <div class="product-card reveal" style="transition-delay: ${(index % 4) * 0.1}s;">
            ${toy.discount ? `<div class="product-badge">-${toy.discount}% Endirim</div>` : ''}
            ${toy.tocoin_price ? `<div class="tocoin-tag">💰 ${toy.tocoin_price} TC</div>` : ''}
            
            <a href="/product.html?id=${toy.id}" style="text-decoration:none; color:inherit;">
                <div class="product-image-container">
                    <img src="${toy.image_url || 'https://placehold.co/400x400?text=Oyuncaq'}" 
                         alt="${toy.name}" 
                         class="product-image">
                </div>
                
                <div class="product-info">
                    <span class="product-category">Oyuncaq</span>
                    <h3 class="product-name">${toy.name}</h3>
                    
                    <div class="product-price-row">
                        <div class="product-price">${toy.price_azn} AZN</div>
                        <div class="btn-add-cart add-to-cart-btn" data-id="${toy.id}" title="Səbətə Əlavə Et">
                            <span style="pointer-events: none;">🛒</span>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    `).join('');

    // Trigger reveal after products are added
    setTimeout(reveal, 100);

    // Add event listeners for cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const currentUser = await getCurrentUser();

            if (!currentUser) {
                Toast.show('Səbətə əlavə etmək üçün daxil olun', 'error');
                setTimeout(() => window.location.href = '/login.html', 1500);
                return;
            }

            const id = btn.dataset.id;
            const toy = toys.find(t => t.id === id);
            Cart.add(toy);

            // Button animation
            const originalContent = btn.innerHTML;
            btn.innerHTML = '✓';
            btn.style.background = 'var(--grad-green)';
            btn.style.color = 'white';

            Toast.show(`${toy.name} səbətə əlavə edildi`, 'success');

            setTimeout(() => {
                btn.innerHTML = originalContent;
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        });
    });

    // Smooth scroll for hero button
    document.querySelector('.btn-primary')?.addEventListener('click', (e) => {
        const targetId = e.target.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
            e.preventDefault();
            document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
        }
    });
}

init();
