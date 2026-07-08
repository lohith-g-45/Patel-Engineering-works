import { supabase } from '../config/supabase.js';

export const DashboardService = {
    async getTotalJobs() {
        try {
            const { count, error } = await supabase
                .from('jobs')
                .select('*', { count: 'exact', head: true });
            
            if (error) throw error;
            return { success: true, data: count || 0 };
        } catch (error) {
            console.error('DashboardService.getTotalJobs error:', error);
            return { success: false, message: 'Failed to fetch total jobs.', error };
        }
    },

    async getOpenJobs() {
        try {
            const { count, error } = await supabase
                .from('jobs')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'OPEN');
            
            if (error) throw error;
            return { success: true, data: count || 0 };
        } catch (error) {
            console.error('DashboardService.getOpenJobs error:', error);
            return { success: false, message: 'Failed to fetch open jobs.', error };
        }
    },

    async getClosedJobs() {
        try {
            const { count, error } = await supabase
                .from('jobs')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'CLOSED');
            
            if (error) throw error;
            return { success: true, data: count || 0 };
        } catch (error) {
            console.error('DashboardService.getClosedJobs error:', error);
            return { success: false, message: 'Failed to fetch closed jobs.', error };
        }
    },

    async getTotalApplications() {
        try {
            const { count, error } = await supabase
                .from('applications')
                .select('*', { count: 'exact', head: true });
            
            if (error) throw error;
            return { success: true, data: count || 0 };
        } catch (error) {
            console.error('DashboardService.getTotalApplications error:', error);
            return { success: false, message: 'Failed to fetch total applications.', error };
        }
    },

    async getRecentApplications(limit = 5) {
        try {
            const { data, error } = await supabase
                .from('applications')
                .select('*, jobs(title)')
                .order('created_at', { ascending: false })
                .limit(limit);
            
            if (error) throw error;
            
            const mappedData = data.map(app => ({
                ...app,
                jobRole: app.jobs?.title || 'Unknown Job'
            }));

            return { success: true, data: mappedData || [] };
        } catch (error) {
            console.error('DashboardService.getRecentApplications error:', error);
            return { success: false, message: 'Failed to fetch recent applications.', error };
        }
    }
};
