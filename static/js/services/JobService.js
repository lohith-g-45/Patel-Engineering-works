import { supabase } from '../config/supabase.js';

export const JobService = {
    async getAllJobs() {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            return { success: true, data: data || [] };
        } catch (error) {
            console.error('JobService.getAllJobs error:', error);
            return { success: false, message: 'Failed to fetch jobs.', error };
        }
    },

    async getOpenJobs() {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('status', 'OPEN')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            return { success: true, data: data || [] };
        } catch (error) {
            console.error('JobService.getOpenJobs error:', error);
            return { success: false, message: 'Failed to fetch open jobs.', error };
        }
    },

    async getJob(id) {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', id)
                .single();
                
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('JobService.getJob error:', error);
            return { success: false, message: 'Failed to fetch job details.', error };
        }
    },

    async createJob(jobData) {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .insert([{
                    title: jobData.title,
                    department: jobData.department,
                    location: jobData.location,
                    experience: jobData.experience,
                    employment_type: jobData.employment_type,
                    description: jobData.description,
                    requirements: jobData.requirements,
                    status: jobData.status
                }])
                .select()
                .single();
                
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('JobService.createJob error:', error);
            return { success: false, message: 'Failed to create job.', error };
        }
    },

    async updateJob(id, jobData) {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .update({
                    title: jobData.title,
                    department: jobData.department,
                    location: jobData.location,
                    experience: jobData.experience,
                    employment_type: jobData.employment_type,
                    description: jobData.description,
                    requirements: jobData.requirements,
                    status: jobData.status
                })
                .eq('id', id)
                .select()
                .single();
                
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('JobService.updateJob error:', error);
            return { success: false, message: 'Failed to update job.', error };
        }
    },

    async deleteJob(id) {
        try {
            const { error } = await supabase
                .from('jobs')
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('JobService.deleteJob error:', error);
            return { success: false, message: 'Failed to delete job.', error };
        }
    },

    async toggleJobStatus(id, currentStatus) {
        const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
        return await this.updateJob(id, { status: newStatus });
    }
};
