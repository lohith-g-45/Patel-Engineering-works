import { supabase } from '../config/supabase.js';

export const AuthService = {
    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return data;
    },

    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getCurrentAdmin() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) return null;
        return user;
    },

    async resetPassword(newPassword) {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });
        
        if (error) throw error;
        return data;
    }
};
