import { supabase } from './supabase.js';
import { Loader, Toast } from './components.js';

export async function register(email, password, fullName) {
    Loader.show();
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`
                }
            }
        });

        if (error) throw error;

        Toast.show('Qeydiyyat uğurlu oldu! Zəhmət olmasa emailinizi təsdiqləyin.', 'success');
        setTimeout(() => window.location.href = '/login.html', 2000);
    } catch (error) {
        Toast.show(error.message, 'error');
    } finally {
        Loader.hide();
    }
}

export async function login(email, password) {
    Loader.show();
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Send login notification
        await supabase.from('notifications').insert({
            user_id: data.user.id,
            title: '🔐 Hesaba Giriş',
            message: `Hesabınıza uğurla giriş edildi. Tarix: ${new Date().toLocaleString('az-AZ')}`,
            type: 'info'
        });

        Toast.show('Giriş uğurlu oldu!', 'success');
        setTimeout(() => window.location.href = '/', 1000);
    } catch (error) {
        Toast.show(error.message, 'error');
    } finally {
        Loader.hide();
    }
}

export async function logout() {
    Loader.show();
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = '/login.html';
    } catch (error) {
        Toast.show(error.message, 'error');
    } finally {
        Loader.hide();
    }
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();

    const path = window.location.pathname;
    const isAuthPage = path.includes('login.html') || path.includes('register.html');

    // If not logged in and not on auth page -> redirect to login
    if (!user && !isAuthPage) {
        window.location.href = '/login.html';
        return null;
    }

    // If logged in and on auth page -> redirect to home
    if (user && isAuthPage) {
        window.location.href = '/';
        return user;
    }

    if (!user) return null;

    // Fetch public profile
    const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) console.error('Error fetching profile:', error);
    return profile || user;
}
