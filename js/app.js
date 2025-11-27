import { supabase } from './supabase.js';
import { renderNavbar, renderFooter, Loader, Toast } from './components.js';
import { getCurrentUser } from './auth.js';
import { Cart } from './cart.js';

async function init() {
    Loader.show();
    const user = await getCurrentUser();
    document.getElementById('app').innerHTML = ''; // Clear loading
    document.getElementById('app').appendChild(renderNavbar(user));

    const main = document.createElement('main');
    main.className = 'container mt-2';
    main.innerHTML = `
        <div class="hero-section text-center mb-2">
            <h1>Uşaq Oyuncaqları Bazarı</h1>
            <p>Ən keyfiyyətli və maraqlı oyuncaqlar bizdə!</p>
        </div>
        
        <div class="filters mb-2" style="display:flex; gap:1rem; justify-content:center;">
            <button class="btn btn-outline active" data-filter="all">Hamısı</button>
            <button class="btn btn-outline" data-filter="lego">Lego</button>
            <button class="btn btn-outline" data-filter="doll">Gəlinciklər</button>
            <button class="btn btn-outline" data-filter="car">Maşınlar</button>
        </div>

        <div id="toys-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 2rem;">
            <!-- Toys will be injected here -->
        </div>
    `;
    document.getElementById('app').appendChild(main);
    document.getElementById('app').appendChild(renderFooter());

    await loadToys();
    Cart.updateCount();
    Loader.hide();
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

    const grid = document.getElementById('toys-grid');
    if (toys.length === 0) {
        grid.innerHTML = '<p class="text-center" style="grid-column: 1/-1">Hal-hazırda məhsul yoxdur.</p>';
        return;
    }

    grid.innerHTML = toys.map(toy => `
        <div class="toy-card" style="border: 1px solid #eee; border-radius: var(--radius-sm); overflow: hidden; transition: transform 0.3s;">
            <a href="/product.html?id=${toy.id}" style="text-decoration:none; color:inherit;">
                <div style="height: 200px; overflow: hidden;">
                    <img src="${toy.image_url || 'https://placehold.co/300x200?text=No+Image'}" alt="${toy.name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="padding: 1rem;">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem;">${toy.name}</h3>
                    <p style="color: #666; font-size: 0.9rem; margin-bottom: 0.5rem;">${toy.price_azn} AZN</p>
                    ${toy.tocoin_price ? `<p style="color: var(--secondary-color); font-weight: 600; font-size: 0.9rem;">${toy.tocoin_price} Tocoin</p>` : ''}
                </div>
            </a>
            <div style="padding: 0 1rem 1rem 1rem;">
                <button class="btn btn-primary btn-sm mt-1 add-to-cart" data-id="${toy.id}" style="width: 100%">Səbətə at</button>
            </div>
        </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const toy = toys.find(t => t.id === id);
            Cart.add(toy);
        });
    });
}

init();
