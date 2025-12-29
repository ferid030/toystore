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

    // Avatar Upload Logic
    document.getElementById('avatar-input').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Loader.show();
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}_${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Upload to receipts bucket (reusing it as it allows auth uploads)
            // Ideally should be a separate 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from('receipts')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL (if using a public bucket) or signed URL
            // Since receipts is private, we should update the DB with the path
            // For simplicity in this demo, we'll try to get the public URL
            const { data: { publicUrl } } = supabase.storage
                .from('receipts')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('users')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            document.getElementById('user-avatar').src = publicUrl;
            Toast.show('Profil şəkli yeniləndi! ✅', 'success');
        } catch (err) {
            console.error('Avatar upload error:', err);
            Toast.show('Şəkil yüklənərkən xəta: ' + err.message, 'error');
        } finally {
            Loader.hide();
        }
    });

    Loader.hide();
}

const statusMap = {
    'pending': { text: 'Gözləyir', class: 'pending' },
    'waiting': { text: 'Gözləyir', class: 'pending' },
    'confirmed': { text: 'Təsdiqləndi', class: 'success' },
    'approved': { text: 'Təsdiqləndi', class: 'success' },
    'rejected': { text: 'Rədd edildi', class: 'danger' },
    'paid': { text: 'Ödənildi', class: 'success' },
    'cancelled': { text: 'Ləğv edildi', class: 'danger' }
};

function getStatusBadge(status) {
    const s = statusMap[status] || { text: status, class: 'info' };
    return `<span class="badge ${s.class}">${s.text}</span>`;
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
        container.innerHTML = '<p style="opacity:0.5; font-size:0.9rem;">Sifariş tarixçəsi boşdur.</p>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="history-item">
            <div>
                <strong style="display:block; font-size:0.95rem;">Sifariş #${order.id.slice(0, 8)}</strong>
                <small style="opacity:0.6;">${new Date(order.created_at).toLocaleDateString()} • ${order.payment_method === 'tocoin' ? 'Tocoin' : 'Kart'}</small>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 800; color: var(--primary-color);" class="mb-1">
                    ${order.payment_method === 'tocoin' ? '' : (order.total_amount_azn + ' AZN')}
                    ${order.payment_method === 'tocoin' ? 'Tocoin ilə' : ''}
                </div>
                ${getStatusBadge(order.status)}
            </div>
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
        container.innerHTML = '<p style="opacity:0.5; font-size:0.9rem;">Qəbz tarixçəsi boşdur.</p>';
        return;
    }

    container.innerHTML = receipts.map(receipt => `
        <div class="history-item">
            <div>
                <strong style="display:block; font-size:0.95rem;">Qəbz #${receipt.id.slice(0, 8)}</strong>
                <small style="opacity:0.6;">${new Date(receipt.created_at).toLocaleDateString()}</small>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 800; color: var(--secondary-color);" class="mb-1">${receipt.amount_azn} AZN</div>
                ${getStatusBadge(receipt.status)}
            </div>
            ${receipt.admin_note ? `<div style="width:100%; margin-top:10px; font-size:0.8rem; color:var(--danger-color); padding:8px; background:rgba(255,0,0,0.05); border-radius:5px;">${receipt.admin_note}</div>` : ''}
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
        container.innerHTML = '<p style="opacity:0.5; font-size:0.9rem;">Tocoin əməliyyatı yoxdur.</p>';
        return;
    }

    container.innerHTML = txs.map(tx => `
        <div class="history-item">
            <div>
                <strong style="display:block; font-size:0.95rem;">${tx.type === 'deposit' ? 'Balans Artımı' : tx.type === 'purchase' ? 'Alış-veriş' : tx.type === 'admin_adjust' ? 'Admin Düzəlişi' : tx.type}</strong>
                <small style="opacity:0.6;">${new Date(tx.created_at).toLocaleDateString()}</small>
            </div>
            <div style="color: ${tx.amount > 0 ? '#2ed573' : '#ff4757'}; font-weight: 800; font-size:1.1rem;">
                ${tx.amount > 0 ? '+' : ''}${tx.amount} TC
            </div>
        </div>
    `).join('');
}

init();
