import { supabase } from '../config/supabase.js';
import { ValidationUtils } from '../utils/validation.js';

export const ApplicationService = {
    async submitApplication(applicationData) {
        try {
            const { data, error } = await supabase
                .from('applications')
                .insert([{
                    applicantName: applicationData.applicantName,
                    email: applicationData.email,
                    phone: applicationData.phone,
                    job_id: applicationData.job_id,
                    resume: applicationData.resume,
                    coverLetter: applicationData.coverLetter
                }])
                .select()
                .single();
                
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('ApplicationService.submitApplication error:', error);
            return { success: false, message: 'Failed to submit application.', error };
        }
    },

    async getApplications() {
        try {
            const { data, error } = await supabase
                .from('applications')
                .select('*, jobs(title)')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            
            // Map the joined jobs(title) back to jobRole for the UI to consume seamlessly
            const mappedData = data.map(app => ({
                ...app,
                jobRole: app.jobs?.title || 'Unknown Job'
            }));

            return { success: true, data: mappedData };
        } catch (error) {
            console.error('ApplicationService.getApplications error:', error);
            return { success: false, message: 'Failed to fetch applications.', error };
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
            return { success: true, data };
        } catch (error) {
            console.error('ApplicationService.updateApplicationStatus error:', error);
            return { success: false, message: 'Failed to update application status.', error };
        }
    },

    async deleteApplication(id) {
        try {
            const { error } = await supabase
                .from('applications')
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('ApplicationService.deleteApplication error:', error);
            return { success: false, message: 'Failed to delete application.', error };
        }
    },

    async uploadResume(file) {
        try {
            const validation = ValidationUtils.isValidResumeFile(file);
            if (!validation.valid) {
                return { success: false, message: validation.message };
            }
            
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

            return { success: true, data: publicUrl };
        } catch (error) {
            console.error('ApplicationService.uploadResume error:', error);
            return { success: false, message: 'Failed to upload resume.', error };
        }
    }
};
