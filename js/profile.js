import { supabase } from './supabase.js';
import { getCurrentUser, logout } from './auth.js';
import { Loader, Toast } from './components.js';

async function init() {
    Loader.show();
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = '/login.html';
        return;
    }

    // Render User Info
    document.getElementById('user-name').textContent = user.full_name || 'İstifadəçi';
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-balance').textContent = user.tocoin_balance || 0;
    document.getElementById('user-avatar').src = user.avatar_url || 'https://placehold.co/100';

    // Load Data
    await Promise.all([
        loadOrders(user.id),
        loadReceipts(user.id),
        loadTransactions(user.id)
    ]);

    document.getElementById('logout-btn').addEventListener('click', logout);
    Loader.hide();
}

async function loadOrders(userId) {
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading orders:', error);
        return;
    }

    const container = document.getElementById('orders-list');
    if (orders.length === 0) {
        container.innerHTML = '<p>Sifariş tarixçəsi boşdur.</p>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="card mb-1" style="padding:1rem; border:1px solid #eee;">
            <div style="display:flex; justify-content:space-between;">
                <strong>Sifariş #${order.id.slice(0, 8)}</strong>
                <span class="badge ${order.status}">${order.status}</span>
            </div>
            <p>${new Date(order.created_at).toLocaleDateString()}</p>
            <p>Məbləğ: ${order.total_amount_azn > 0 ? order.total_amount_azn + ' AZN' : 'Tocoin'}</p>
            <p>Ödəniş: ${order.payment_method}</p>
        </div>
    `).join('');
}

async function loadReceipts(userId) {
    const { data: receipts, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading receipts:', error);
        return;
    }

    const container = document.getElementById('receipts-list');
    if (receipts.length === 0) {
        container.innerHTML = '<p>Qəbz tarixçəsi boşdur.</p>';
        return;
    }

    container.innerHTML = receipts.map(receipt => `
        <div class="card mb-1" style="padding:1rem; border:1px solid #eee;">
            <div style="display:flex; justify-content:space-between;">
                <strong>Qəbz #${receipt.id.slice(0, 8)}</strong>
                <span class="badge ${receipt.status}">${receipt.status}</span>
            </div>
            <p>Məbləğ: ${receipt.amount_azn} AZN</p>
            ${receipt.admin_note ? `<p style="color:red; font-size:0.9rem;">Qeyd: ${receipt.admin_note}</p>` : ''}
        </div>
    `).join('');
}

async function loadTransactions(userId) {
    const { data: txs, error } = await supabase
        .from('tocoin_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading transactions:', error);
        return;
    }

    const container = document.getElementById('transactions-list');
    if (txs.length === 0) {
        container.innerHTML = '<p>Tocoin əməliyyatı yoxdur.</p>';
        return;
    }

    container.innerHTML = txs.map(tx => `
        <div class="card mb-1" style="padding:0.5rem; border-bottom:1px solid #eee; display:flex; justify-content:space-between;">
            <div>
                <strong>${tx.type.toUpperCase()}</strong>
                <br><small>${new Date(tx.created_at).toLocaleDateString()}</small>
            </div>
            <div style="color: ${tx.amount > 0 ? 'green' : 'red'}; font-weight:bold;">
                ${tx.amount > 0 ? '+' : ''}${tx.amount}
            </div>
        </div>
    `).join('');
}

init();
