import { supabase } from '../config/supabase.js';

export const ApplicationService = {
    async submitApplication(applicationData) {
        const { data, error } = await supabase
            .from('applications')
            .insert([applicationData])
            .select()
            .single();
            
        if (error) throw error;
        return data;
    },

    async getApplications() {
        const { data, error } = await supabase
            .from('applications')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data || [];
    },

    async updateApplicationStatus(id, newStatus) {
        const { data, error } = await supabase
            .from('applications')
            .update({ status: newStatus })
            .eq('id', id)
            .select()
            .single();
            
        if (error) throw error;
        return data;
    },

    async deleteApplication(id) {
        const { error } = await supabase
            .from('applications')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
    },

    async uploadResume(file) {
        if (!file) throw new Error('No file provided');
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `resumes/${fileName}`;

        const { data, error } = await supabase.storage
            .from('career-documents')
            .upload(filePath, file);

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('career-documents')
            .getPublicUrl(filePath);

        return publicUrl;
    }
};
