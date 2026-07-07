import { LocalStore } from '../data/localStore.js';

export const ApplicationService = {
  getAllApplications: async () => {
    return LocalStore.get('applications') || [];
  },
  
  createApplication: async (appData) => {
    const apps = LocalStore.get('applications') || [];
    const newApp = {
      ...appData,
      id: Date.now().toString(),
      status: 'Pending',
      appliedDate: new Date().toLocaleDateString('en-GB'),
      appliedTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };
    apps.push(newApp);
    LocalStore.set('applications', apps);
    return newApp;
  },
  
  updateApplicationStatus: async (id, status) => {
    const apps = LocalStore.get('applications') || [];
    const index = apps.findIndex(app => app.id === id);
    if (index !== -1) {
      apps[index].status = status;
      LocalStore.set('applications', apps);
      return apps[index];
    }
    throw new Error('Application not found');
  },
  
  deleteApplication: async (id) => {
    let apps = LocalStore.get('applications') || [];
    apps = apps.filter(app => app.id !== id);
    LocalStore.set('applications', apps);
    return true;
  }
};
