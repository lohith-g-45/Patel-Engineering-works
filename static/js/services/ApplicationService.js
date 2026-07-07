import { supabase } from '../config/supabase.js';

export const ApplicationService = {
    async submitApplication(applicationData) {
        try {
            const { data, error } = await supabase
                .from('applications')
                .insert([applicationData])
                .select()
                .single();
                
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('ApplicationService.submitApplication error:', error);
            throw new Error('Failed to submit application.');
        }
    },

    async getApplications() {
        try {
            const { data, error } = await supabase
                .from('applications')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('ApplicationService.getApplications error:', error);
            throw new Error('Failed to fetch applications.');
        }
    },

    async updateApplicationStatus(id, newStatus) {
        try {
            const { data, error } = await supabase
                .from('applications')
                .update({ status: newStatus })
                .eq('id', id)
                .select()
                .single();
                
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('ApplicationService.updateApplicationStatus error:', error);
            throw new Error('Failed to update application status.');
        }
    },

    async deleteApplication(id) {
        try {
            const { error } = await supabase
                .from('applications')
                .delete()
                .eq('id', id);
                
            if (error) throw error;
        } catch (error) {
            console.error('ApplicationService.deleteApplication error:', error);
            throw new Error('Failed to delete application.');
        }
    },

    async uploadResume(file) {
        try {
            if (!file) throw new Error('No file provided');
            
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `resumes/${fileName}`;

            const { data, error } = await supabase.storage
                .from('resumes')
                .upload(filePath, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('resumes')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('ApplicationService.uploadResume error:', error);
            throw new Error('Failed to upload resume.');
        }
    }
};
