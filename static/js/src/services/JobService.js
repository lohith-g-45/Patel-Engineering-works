import { supabase } from '../config/supabase.js';

export const JobService = {
    async getAllJobs() {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data || [];
    },

    async getOpenJobs() {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('status', 'OPEN')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data || [];
    },

    async getJobById(id) {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', id)
            .single();
            
        if (error) throw error;
        return data;
    },

    async createJob(jobData) {
        const { data, error } = await supabase
            .from('jobs')
            .insert([jobData])
            .select()
            .single();
            
        if (error) throw error;
        return data;
    },

    async updateJob(id, jobData) {
        const { data, error } = await supabase
            .from('jobs')
            .update(jobData)
            .eq('id', id)
            .select()
            .single();
            
        if (error) throw error;
        return data;
    },

    async deleteJob(id) {
        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
    },

    async toggleJobStatus(id, currentStatus) {
        const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
        return await this.updateJob(id, { status: newStatus });
    }
};
