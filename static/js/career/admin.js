import { LocalStore } from './data/localStore.js';
import { JobService } from './services/JobService.js';
import { ApplicationService } from './services/ApplicationService.js';

document.addEventListener('DOMContentLoaded', async () => {
  LocalStore.init();

  const loginView = document.getElementById('login-view');
  const appView = document.getElementById('app-view');
  
  // Auth Check
  if (localStorage.getItem('isCareersAdminAuthValidated') === 'true') {
    loginView.style.display = 'none';
    appView.style.display = 'flex';
    loadDashboard();
  }

  // Login Form
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    if (user === 'lg8717429@gmail.com' && pass === 'abc@123') {
      localStorage.setItem('isCareersAdminAuthValidated', 'true');
      loginView.style.display = 'none';
      appView.style.display = 'flex';
      loadDashboard();
    } else {
      const err = document.getElementById('login-error');
      err.textContent = 'Invalid username or password';
      err.style.display = 'block';
    }
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('isCareersAdminAuthValidated');
    appView.style.display = 'none';
    loginView.style.display = 'flex';
  });

  // Navigation
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      const targetId = item.getAttribute('data-target');
      views.forEach(view => view.classList.remove('active'));
      document.getElementById(targetId).classList.add('active');
      
      if (targetId === 'dashboard') loadDashboard();
      if (targetId === 'jobs') loadJobs();
      if (targetId === 'applications') loadApplications();
    });
  });

  // --- Data Loading Functions ---

  async function loadDashboard() {
    const jobs = await JobService.getAllJobs();
    const apps = await ApplicationService.getAllApplications();
    
    document.getElementById('stat-total-jobs').textContent = jobs.length;
    document.getElementById('stat-open-jobs').textContent = jobs.filter(j => j.status === 'Open').length;
    document.getElementById('stat-closed-jobs').textContent = jobs.filter(j => j.status === 'Closed').length;
    document.getElementById('stat-total-apps').textContent = apps.length;
  }

  async function loadJobs() {
    const jobs = await JobService.getAllJobs();
    const tbody = document.getElementById('jobs-tbody');
    tbody.innerHTML = '';
    
    if (jobs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-light);">No jobs found.</td></tr>`;
      return;
    }
    
    jobs.forEach(job => {
      const badgeClass = job.status === 'Open' ? 'badge-success' : 'badge-danger';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 500;">${job.title}</td>
        <td style="color: var(--text-light);">${job.department}</td>
        <td style="color: var(--text-light);">${job.location}</td>
        <td><span class="badge ${badgeClass}">${job.status}</span></td>
        <td style="text-align: right;">
          <button class="btn-action toggle-status-btn" data-id="${job.id}">Status</button>
          <button class="btn-action edit-job-btn" data-id="${job.id}">Edit</button>
          <button class="btn-action delete delete-job-btn" data-id="${job.id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Attach Job Actions
    document.querySelectorAll('.toggle-status-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.closest('button').getAttribute('data-id');
        const job = await JobService.getJobById(id);
        await JobService.updateJob(id, { status: job.status === 'Open' ? 'Closed' : 'Open' });
        loadJobs();
      });
    });

    document.querySelectorAll('.edit-job-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.closest('button').getAttribute('data-id');
        const job = await JobService.getJobById(id);
        openJobModal(job);
      });
    });

    document.querySelectorAll('.delete-job-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (confirm('Are you sure you want to delete this job?')) {
          const id = e.target.closest('button').getAttribute('data-id');
          await JobService.deleteJob(id);
          loadJobs();
        }
      });
    });
  }

  async function loadApplications() {
    const apps = await ApplicationService.getAllApplications();
    const tbody = document.getElementById('apps-tbody');
    tbody.innerHTML = '';
    
    if (apps.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-light);">No applications yet.</td></tr>`;
      return;
    }
    
    // Reverse sort to show newest first
    apps.sort((a, b) => b.id - a.id).forEach(app => {
      const getBadge = (s) => {
        switch(s) {
          case 'Hired': return 'badge-success';
          case 'Rejected': return 'badge-danger';
          case 'Pending': return 'badge-warning';
          default: return 'badge-neutral';
        }
      };
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="font-weight: 600; color: var(--primary);">${app.applicantName}</div>
          <div style="font-size: 0.85rem; color: var(--text-light);">${app.email}</div>
          <div style="font-size: 0.85rem; color: var(--text-light);">${app.phone}</div>
        </td>
        <td style="font-weight: 500;">${app.jobRole}</td>
        <td style="color: var(--text-light);">
          <div>${app.appliedDate}</div>
          <div style="font-size: 0.85rem;">${app.appliedTime}</div>
        </td>
        <td>
          <a href="#" onclick="alert('Resume viewing is mocked in this local version.'); return false;" style="color: var(--primary-light);">
            ${app.resume}
          </a>
        </td>
        <td>
          <select class="input-field status-select badge ${getBadge(app.status)}" data-id="${app.id}" style="width: auto; padding: 0.35rem 0.75rem; border: none; cursor: pointer;">
            <option value="Pending" ${app.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Shortlisted" ${app.status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
            <option value="Interview Scheduled" ${app.status === 'Interview Scheduled' ? 'selected' : ''}>Interview Scheduled</option>
            <option value="Hired" ${app.status === 'Hired' ? 'selected' : ''}>Hired</option>
            <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </td>
        <td style="text-align: right;">
          <button class="btn-action delete delete-app-btn" data-id="${app.id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Attach Status Select Changes
    document.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        const id = e.target.getAttribute('data-id');
        const newStatus = e.target.value;
        await ApplicationService.updateApplicationStatus(id, newStatus);
        // Change select class visually immediately without reload to avoid flicker
        e.target.className = `input-field status-select badge ${
          newStatus === 'Hired' ? 'badge-success' : 
          newStatus === 'Rejected' ? 'badge-danger' : 
          newStatus === 'Pending' ? 'badge-warning' : 'badge-neutral'
        }`;
      });
    });

    // Attach Delete Application
    document.querySelectorAll('.delete-app-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (confirm('Are you sure you want to delete this applicant? This action cannot be undone.')) {
          const id = e.target.closest('button').getAttribute('data-id');
          await ApplicationService.deleteApplication(id);
          loadApplications();
          loadDashboard(); // Refresh stats
        }
      });
    });
  }

  // --- Job Modal Logic ---
  const jobModal = document.getElementById('job-modal');
  
  function openJobModal(job = null) {
    document.getElementById('modal-title').textContent = job ? 'Edit Job' : 'Add New Job';
    document.getElementById('job-id').value = job ? job.id : '';
    document.getElementById('job-title').value = job ? job.title : '';
    document.getElementById('job-dept').value = job ? job.department : '';
    document.getElementById('job-loc').value = job ? job.location : '';
    document.getElementById('job-exp').value = job ? job.experience : '';
    document.getElementById('job-type').value = job ? job.employmentType : 'Full-time';
    document.getElementById('job-status').value = job ? job.status : 'Open';
    document.getElementById('job-desc').value = job ? job.description : '';
    document.getElementById('job-reqs').value = job ? job.requirements : '';
    
    jobModal.classList.add('active');
  }

  document.getElementById('btn-add-job').addEventListener('click', () => openJobModal());
  document.getElementById('btn-cancel-job').addEventListener('click', () => jobModal.classList.remove('active'));

  document.getElementById('job-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('job-id').value;
    const jobData = {
      title: document.getElementById('job-title').value,
      department: document.getElementById('job-dept').value,
      location: document.getElementById('job-loc').value,
      experience: document.getElementById('job-exp').value,
      employmentType: document.getElementById('job-type').value,
      status: document.getElementById('job-status').value,
      description: document.getElementById('job-desc').value,
      requirements: document.getElementById('job-reqs').value,
      salary: '' // Added for compatibility
    };

    if (id) {
      await JobService.updateJob(id, jobData);
    } else {
      await JobService.createJob(jobData);
    }
    
    jobModal.classList.remove('active');
    loadJobs();
  });
});
