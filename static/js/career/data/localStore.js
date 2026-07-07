export const LocalStore = {
  get: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error reading from localStorage', e);
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error writing to localStorage', e);
    }
  },
  init: () => {
    if (!LocalStore.get('jobs')) {
      LocalStore.set('jobs', [
        {
          id: '1',
          title: 'Electrical Supervisor',
          department: 'Ship Repair',
          location: 'Vishakhapatnam',
          experience: '5 - 10 years',
          employmentType: 'Full-time',
          salary: '',
          description: 'Supervise electrical systems repair and maintenance on marine vessels.',
          requirements: 'Diploma / B.Tech in Electrical Engineering. Minimum 5 years marine experience.',
          status: 'Open',
          createdAt: new Date().toISOString()
        }
      ]);
    }
    if (!LocalStore.get('applications')) {
      LocalStore.set('applications', []);
    }
  }
};
