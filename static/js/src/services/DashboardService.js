import { JobService } from './JobService.js';
import { ApplicationService } from './ApplicationService.js';

export const DashboardService = {
    async getDashboardStats() {
        try {
            const [jobs, applications] = await Promise.all([
                JobService.getAllJobs(),
                ApplicationService.getApplications()
            ]);

            const openJobs = jobs.filter(j => j.status === 'OPEN').length;
            const closedJobs = jobs.filter(j => j.status === 'CLOSED').length;
            
            // Get 5 most recent applications
            const recentApplications = applications.slice(0, 5);

            return {
                totalJobs: jobs.length,
                openJobs: openJobs,
                closedJobs: closedJobs,
                totalApplications: applications.length,
                recentApplications: recentApplications
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }
};
