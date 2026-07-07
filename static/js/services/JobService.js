import { supabase } from '../config/supabase.js';

export const JobService = {
    async getAllJobs() {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('JobService.getAllJobs error:', error);
            throw new Error('Failed to fetch jobs.');
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
            return data || [];
        } catch (error) {
            console.error('JobService.getOpenJobs error:', error);
            throw new Error('Failed to fetch open jobs.');
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
            return data;
        } catch (error) {
            console.error('JobService.getJob error:', error);
            throw new Error('Failed to fetch job details.');
        }
    },

    async createJob(jobData) {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .insert([jobData])
                .select()
                .single();
                
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('JobService.createJob error:', error);
            throw new Error('Failed to create job.');
        }
    },

    async updateJob(id, jobData) {
        try {
            const { data, error } = await supabase
                .from('jobs')
                .update(jobData)
                .eq('id', id)
                .select()
                .single();
                
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('JobService.updateJob error:', error);
            throw new Error('Failed to update job.');
        }
    },

    async deleteJob(id) {
        try {
            const { error } = await supabase
                .from('jobs')
                .delete()
                .eq('id', id);
                
            if (error) throw error;
        } catch (error) {
            console.error('JobService.deleteJob error:', error);
            throw new Error('Failed to delete job.');
        }
    },

    async toggleJobStatus(id, currentStatus) {
        const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
        return await this.updateJob(id, { status: newStatus });
    }
};
