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
            // 1. Update Receipt Status
            const { error: receiptError } = await supabase
                .from('receipts')
                .update({ status: 'confirmed', admin_note: 'Təsdiqləndi' })
                .eq('id', receiptId);

            if (receiptError) throw receiptError;

            // 2. Add Transaction
            const { error: txError } = await supabase
                .from('tocoin_transactions')
                .insert({
                    user_id: userId,
                    amount: amountTocoin,
                    type: 'deposit',
                    reference: receiptId
                });

            if (txError) throw txError;

            // 3. Update User Balance (RPC or manual fetch-update)
            // Fetch current balance first to be safe
            const { data: user } = await supabase.from('users').select('tocoin_balance').eq('id', userId).single();
            const newBalance = (user.tocoin_balance || 0) + parseFloat(amountTocoin);

            const { error: balanceError } = await supabase
                .from('users')
                .update({ tocoin_balance: newBalance })
                .eq('id', userId);

            if (balanceError) throw balanceError;

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
            const { error } = await supabase
                .from('receipts')
                .update({ status: 'rejected', admin_note: reason })
                .eq('id', receiptId);

            if (error) throw error;
            Toast.show('Qəbz imtina edildi.', 'info');
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            Toast.show(error.message, 'error');
        } finally {
            Loader.hide();
        }
    }
};
