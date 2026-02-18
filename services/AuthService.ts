import { supabase } from './SupabaseClient';
import { Session, User } from '@supabase/supabase-js';

export const AuthService = {
    async signUp(email: string, password: string): Promise<{ user: User | null; error: any }> {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        return { user: data.user, error };
    },

    async signIn(email: string, password: string, rememberMe: boolean = true): Promise<{ session: Session | null; user: User | null; error: any }> {
        // If "Remember Me" is unchecked, we can't easily switch storage engines on the fly with the single client instance
        // without re-configuring it. However, Supabase persists by default.
        // For a simple implementation, we will stick to default persistence.
        // If strict session-only storage is required for "Remember Me = false", we would need to manually clear storage on window close
        // or configure a custom storage adapter.
        // For now, we will proceed with default persistence behaviour, but we could add logic here if strict compliance is needed.

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        return { session: data.session, user: data.user, error };
    },

    async signOut(): Promise<{ error: any }> {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    async resetPassword(email: string): Promise<{ error: any }> {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/#/reset-password-update`,
        });
        return { error };
    },

    async updatePassword(password: string): Promise<{ error: any }> {
        const { error } = await supabase.auth.updateUser({ password });
        return { error };
    },

    async getSession(): Promise<{ session: Session | null }> {
        const { data } = await supabase.auth.getSession();
        return { session: data.session };
    },

    onAuthStateChange(callback: (event: string, session: Session | null) => void) {
        return supabase.auth.onAuthStateChange(callback);
    }
};
