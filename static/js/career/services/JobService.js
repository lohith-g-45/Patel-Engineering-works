import { LocalStore } from '../data/localStore.js';

export const JobService = {
  getAllJobs: async () => {
    return LocalStore.get('jobs') || [];
  },
  
  getOpenJobs: async () => {
    const jobs = LocalStore.get('jobs') || [];
    return jobs.filter(job => job.status === 'Open');
  },
  
  getJobById: async (id) => {
    const jobs = LocalStore.get('jobs') || [];
    return jobs.find(job => job.id === id);
  },
  
  createJob: async (jobData) => {
    const jobs = LocalStore.get('jobs') || [];
    const newJob = {
      ...jobData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    jobs.push(newJob);
    LocalStore.set('jobs', jobs);
    return newJob;
  },
  
  updateJob: async (id, updates) => {
    const jobs = LocalStore.get('jobs') || [];
    const index = jobs.findIndex(job => job.id === id);
    if (index !== -1) {
      jobs[index] = { ...jobs[index], ...updates };
      LocalStore.set('jobs', jobs);
      return jobs[index];
    }
    throw new Error('Job not found');
  },
  
  deleteJob: async (id) => {
    let jobs = LocalStore.get('jobs') || [];
    jobs = jobs.filter(job => job.id !== id);
    LocalStore.set('jobs', jobs);
    return true;
  }
};
