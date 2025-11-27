import { supabase } from './supabase.js';
import { Loader, Toast } from './components.js';
import { getCurrentUser } from './auth.js';

// Check Admin Role
export async function checkAdmin() {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        window.location.href = '/';
        return null;
    }
    return user;
}

// Manage Toys
export const AdminToys = {
    add: async (toyData, imageFile) => {
        Loader.show();
        try {
            let imageUrl = null;
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `toys/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('toys')
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('toys')
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            }

            const { error } = await supabase
                .from('toys')
                .insert({
                    ...toyData,
                    image_url: imageUrl,
                    slug: toyData.name.toLowerCase().replace(/ /g, '-') + '-' + Date.now()
                });

            if (error) throw error;
            Toast.show('Oyuncaq əlavə edildi!', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            Toast.show(error.message, 'error');
        } finally {
            Loader.hide();
        }
    },

    delete: async (id) => {
        if (!confirm('Silmək istədiyinizə əminsiniz?')) return;
        Loader.show();
        try {
            const { error } = await supabase.from('toys').delete().eq('id', id);
            if (error) throw error;
            Toast.show('Silindi!', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            Toast.show(error.message, 'error');
        } finally {
            Loader.hide();
        }
    }
};

// Manage Receipts
export const AdminReceipts = {
    approve: async (receiptId, userId, amountTocoin) => {
        Loader.show();
        try {
            const { error: receiptError } = await supabase
                .from('receipts')
                .update({ status: 'confirmed', admin_note: 'Təsdiqləndi' })
                .eq('id', receiptId);

            if (receiptError) throw receiptError;

            const { error: txError } = await supabase
                .from('tocoin_transactions')
                .insert({
                    user_id: userId,
                    amount: amountTocoin,
                    type: 'deposit',
                    reference: receiptId
                });

            if (txError) throw txError;

            const { data: user } = await supabase.from('users').select('tocoin_balance').eq('id', userId).single();
            const newBalance = (user.tocoin_balance || 0) + parseFloat(amountTocoin);

            const { error: balanceError } = await supabase
                .from('users')
                .update({ tocoin_balance: newBalance })
                .eq('id', userId);

            if (balanceError) throw balanceError;

            // Send notification
            await supabase.from('notifications').insert({
                user_id: userId,
                title: '✅ Qəbz Təsdiqləndi',
                message: `Sizin ${amountTocoin} AZN məbləğli qəbziniz təsdiqləndi və ${amountTocoin} Tocoin balansınıza əlavə edildi.`,
                type: 'success'
            });

            Toast.show('Qəbz təsdiqləndi və balans artırıldı!', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            Toast.show(error.message, 'error');
        } finally {
            Loader.hide();
        }
    },

    reject: async (receiptId, reason) => {
        Loader.show();
        try {
            const { data: receipt } = await supabase
                .from('receipts')
                .select('user_id, amount_azn')
                .eq('id', receiptId)
                .single();

            const { error } = await supabase
                .from('receipts')
                .update({ status: 'rejected', admin_note: reason })
                .eq('id', receiptId);

            if (error) throw error;

            // Send notification
            if (receipt) {
                await supabase.from('notifications').insert({
                    user_id: receipt.user_id,
                    title: '❌ Qəbz Rədd Edildi',
                    message: `Sizin ${receipt.amount_azn} AZN məbləğli qəbziniz rədd edildi. Səbəb: ${reason}`,
                    type: 'error'
                });
            }

            Toast.show('Qəbz imtina edildi.', 'info');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            Toast.show(error.message, 'error');
        } finally {
            Loader.hide();
        }
    }
};

// Manage Users
export const AdminUsers = {
    adjustBalance: async (userId, amount) => {
        Loader.show();
        try {
            const { data: user } = await supabase.from('users').select('tocoin_balance').eq('id', userId).single();
            const newBalance = (user.tocoin_balance || 0) + parseFloat(amount);

            const { error } = await supabase
                .from('users')
                .update({ tocoin_balance: newBalance })
                .eq('id', userId);

            if (error) throw error;

            await supabase.from('tocoin_transactions').insert({
                user_id: userId,
                amount: amount,
                type: amount > 0 ? 'credit' : 'debit',
                description: 'Admin tərəfindən balans düzəlişi'
            });

            Toast.show('Balans yeniləndi!', 'success');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            Toast.show(error.message, 'error');
        } finally {
            Loader.hide();
        }
    }
};
