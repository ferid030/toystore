import { supabase } from './supabase.js';
import { Toast } from './components.js';

export const Cart = {
    get: () => {
        return JSON.parse(localStorage.getItem('cart')) || [];
    },

    add: (toy) => {
        const cart = Cart.get();
        const existingItem = cart.find(item => item.id === toy.id);

        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({ ...toy, qty: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        Cart.updateCount();
        Toast.show('Məhsul səbətə əlavə olundu!', 'success');
    },

    remove: (toyId) => {
        let cart = Cart.get();
        cart = cart.filter(item => item.id !== toyId);
        localStorage.setItem('cart', JSON.stringify(cart));
        Cart.updateCount();
    },

    updateQty: (toyId, qty) => {
        const cart = Cart.get();
        const item = cart.find(item => item.id === toyId);
        if (item) {
            item.qty = qty;
            if (item.qty <= 0) {
                Cart.remove(toyId);
            } else {
                localStorage.setItem('cart', JSON.stringify(cart));
                Cart.updateCount();
            }
        }
    },

    clear: () => {
        localStorage.removeItem('cart');
        Cart.updateCount();
    },

    updateCount: () => {
        const cart = Cart.get();
        const count = cart.reduce((acc, item) => acc + item.qty, 0);
        const badge = document.querySelector('.cart-count');
        if (badge) badge.textContent = count;
    },

    syncWithDB: async (userId) => {
        // Optional: Sync local cart with DB on login
        // For MVP, we'll stick to localStorage or simple DB sync if needed
    }
};
