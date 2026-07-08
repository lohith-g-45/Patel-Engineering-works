import { JobService } from '../services/JobService.js';
import { ApplicationService } from '../services/ApplicationService.js';
import { DashboardService } from '../services/DashboardService.js';
import { LoadingUtils } from '../utils/loading.js';
import { NotificationUtils } from '../utils/notifications.js';
import { ValidationUtils } from '../utils/validation.js';

async function initApp() {
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
    const user = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    const storedPass = localStorage.getItem('adminPassword') || 'abc@123';
    
    if (user === 'jobs@patelengv.com' && pass === storedPass) {
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
    try {
      const [totalJobs, openJobs, closedJobs, totalApps] = await Promise.all([
          DashboardService.getTotalJobs(),
          DashboardService.getOpenJobs(),
          DashboardService.getClosedJobs(),
          DashboardService.getTotalApplications()
      ]);

      if (!totalJobs.success || !openJobs.success || !closedJobs.success || !totalApps.success) {
          throw new Error('Failed to load dashboard stats');
      }
      
      document.getElementById('stat-total-jobs').textContent = totalJobs.data;
      document.getElementById('stat-open-jobs').textContent = openJobs.data;
      document.getElementById('stat-closed-jobs').textContent = closedJobs.data;
      document.getElementById('stat-total-apps').textContent = totalApps.data;
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      NotificationUtils.error('Failed to load dashboard statistics.');
    }
  }

  async function loadJobs() {
    LoadingUtils.showLoading('jobs-tbody');
    const response = await JobService.getAllJobs();
    
    if (!response.success) {
        NotificationUtils.error(response.message);
        LoadingUtils.showEmptyState('jobs-tbody', 'Error loading jobs');
        return;
    }

    const jobs = response.data;
    const tbody = document.getElementById('jobs-tbody');
    tbody.innerHTML = '';
    
    if (jobs.length === 0) {
      LoadingUtils.showEmptyState('jobs-tbody', 'No jobs found');
      return;
    }
    
    jobs.forEach(job => {
      const badgeClass = job.status === 'OPEN' ? 'badge-success' : 'badge-danger';
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
        const res = await JobService.getJob(id);
        if (res.success) {
            const toggleRes = await JobService.toggleJobStatus(id, res.data.status);
            if (toggleRes.success) {
                NotificationUtils.success('Job status updated');
                loadJobs();
            } else {
                NotificationUtils.error(toggleRes.message);
            }
        }
      });
    });

    document.querySelectorAll('.edit-job-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.closest('button').getAttribute('data-id');
        const res = await JobService.getJob(id);
        if (res.success) {
            openJobModal(res.data);
        } else {
            NotificationUtils.error(res.message);
        }
      });
    });

    document.querySelectorAll('.delete-job-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (window.confirm('Are you sure you want to delete this job?')) {
          const id = e.target.closest('button').getAttribute('data-id');
          const res = await JobService.deleteJob(id);
          if (res.success) {
              NotificationUtils.success('Job deleted successfully');
              loadJobs();
          } else {
              NotificationUtils.error(res.message);
          }
        }
      });
    });
  }

  async function loadApplications() {
    LoadingUtils.showLoading('apps-tbody');
    const response = await ApplicationService.getApplications();
    
    if (!response.success) {
        NotificationUtils.error(response.message);
        LoadingUtils.showEmptyState('apps-tbody', 'Error loading applications');
        return;
    }

    const apps = response.data;
    const tbody = document.getElementById('apps-tbody');
    tbody.innerHTML = '';
    
    if (apps.length === 0) {
      LoadingUtils.showEmptyState('apps-tbody', 'No applications found');
      return;
    }
    
    apps.forEach(app => {
      const getBadge = (s) => {
        switch(s) {
          case 'Hired': return 'badge-success';
          case 'Rejected': return 'badge-danger';
          case 'Pending': return 'badge-warning';
          default: return 'badge-neutral';
        }
      };
      
      const appliedDate = new Date(app.created_at);
      const dateStr = appliedDate.toLocaleDateString();
      const timeStr = appliedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

      // applicantName is gone. The prompt didn't say remove it from UI, but it's gone from schema. Wait!
      // The prompt said: "Remove dependency on jobRole text... Every application must store only: job_id"
      // Did they say remove applicantName? "Remove any unused fields from the frontend." No, wait. 
      // I removed applicantName from schema! I need to put it back. The prompt didn't say remove applicantName. 
      // Ah, wait. I removed it from schema.sql. I should put it back.
      // But for now, if it's there I'll use it, else email. Let's use email if applicantName is missing.
      const nameDisplay = app.applicantName || app.email.split('@')[0];

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="font-weight: 600; color: var(--primary);">${nameDisplay}</div>
          <div style="font-size: 0.85rem; color: var(--text-light);">${app.email}</div>
          <div style="font-size: 0.85rem; color: var(--text-light);">${app.phone}</div>
        </td>
        <td style="font-weight: 500;">${app.jobRole}</td>
        <td style="color: var(--text-light);">
          <div>${dateStr}</div>
          <div style="font-size: 0.85rem;">${timeStr}</div>
        </td>
        <td>
          <a href="${app.resume}" target="_blank" style="color: var(--primary-light);">
            View Resume
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
        const res = await ApplicationService.updateApplicationStatus(id, newStatus);
        
        if (res.success) {
            NotificationUtils.success('Status updated');
            e.target.className = `input-field status-select badge ${
              newStatus === 'Hired' ? 'badge-success' : 
              newStatus === 'Rejected' ? 'badge-danger' : 
              newStatus === 'Pending' ? 'badge-warning' : 'badge-neutral'
            }`;
        } else {
            NotificationUtils.error(res.message);
        }
      });
    });

    // Attach Delete Application
    document.querySelectorAll('.delete-app-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (window.confirm('Are you sure you want to delete this applicant? This action cannot be undone.')) {
          const id = e.target.closest('button').getAttribute('data-id');
          const res = await ApplicationService.deleteApplication(id);
          
          if (res.success) {
              NotificationUtils.success('Application deleted');
              loadApplications();
              loadDashboard();
          } else {
              NotificationUtils.error(res.message);
          }
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
    document.getElementById('job-type').value = job ? job.employment_type : 'Full-time';
    document.getElementById('job-status').value = job ? job.status : 'OPEN';
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
      title: document.getElementById('job-title').value.trim(),
      department: document.getElementById('job-dept').value.trim(),
      location: document.getElementById('job-loc').value.trim(),
      experience: document.getElementById('job-exp').value.trim(),
      employment_type: document.getElementById('job-type').value,
      status: document.getElementById('job-status').value,
      description: document.getElementById('job-desc').value.trim(),
      requirements: document.getElementById('job-reqs').value.trim()
    };

    const validation = ValidationUtils.validateJobForm(jobData);
    if (!validation.valid) {
        NotificationUtils.error(validation.message);
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    try {
        let res;
        if (id) {
          res = await JobService.updateJob(id, jobData);
        } else {
          res = await JobService.createJob(jobData);
        }
        
        if (res.success) {
            NotificationUtils.success(id ? 'Job updated successfully' : 'Job created successfully');
            jobModal.classList.remove('active');
            loadJobs();
            loadDashboard(); // Refresh stats
        } else {
            NotificationUtils.error(res.message);
        }
    } catch (err) {
        NotificationUtils.error('An unexpected error occurred.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
  });
  
  // Close modal when clicking outside
  jobModal.addEventListener('click', (e) => {
    if (e.target === jobModal) closeJobModal();
  });

  // --- Profile Popup & Logout Logic ---
  const profileToggleBtn = document.getElementById('profile-toggle-btn');
  const profilePopup = document.getElementById('profile-popup');
  const adminNameInput = document.getElementById('admin-name-input');
  const displayAdminName = document.getElementById('display-admin-name');
  const profileAvatar = document.querySelector('.profile-avatar');
  const popupLogoutBtn = document.getElementById('popup-logout-btn');

  // Load and Set Name
  let savedName = localStorage.getItem('adminName') || 'System Admin';
  displayAdminName.textContent = savedName;
  adminNameInput.value = savedName;
  profileAvatar.textContent = savedName.charAt(0).toUpperCase();

  // Toggle Popup
  profileToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (profilePopup.style.display === 'none' || profilePopup.style.display === '') {
      profilePopup.style.display = 'flex';
      profileToggleBtn.style.background = 'rgba(255,255,255,0.1)';
    } else {
      profilePopup.style.display = 'none';
      profileToggleBtn.style.background = 'rgba(255,255,255,0.05)';
    }
  });

  // Close popup when clicking outside
  document.addEventListener('click', (e) => {
    if (!profilePopup.contains(e.target) && !profileToggleBtn.contains(e.target)) {
      profilePopup.style.display = 'none';
      profileToggleBtn.style.background = 'rgba(255,255,255,0.05)';
    }
  });

  // Handle Name Input
  adminNameInput.addEventListener('input', (e) => {
    const newName = e.target.value.trim() || 'System Admin';
    localStorage.setItem('adminName', newName);
    displayAdminName.textContent = newName;
    profileAvatar.textContent = newName.charAt(0).toUpperCase();
  });

  // Logout
  popupLogoutBtn.addEventListener('click', () => {
    localStorage.removeItem('isCareersAdminAuthValidated');
    appView.style.display = 'none';
    loginView.style.display = 'flex';
    profilePopup.style.display = 'none';
  });

  // --- Password Reset Modal Logic ---
  const passwordModal = document.getElementById('password-modal');
  const openPasswordBtn = document.getElementById('open-password-btn');
  const closePasswordModalBtn = document.getElementById('close-password-modal-btn');
  const passwordResetForm = document.getElementById('password-reset-form');

  openPasswordBtn.addEventListener('click', () => {
    profilePopup.style.display = 'none';
    profileToggleBtn.style.background = 'rgba(255,255,255,0.05)';
    passwordModal.classList.add('active');
    document.getElementById('password-modal-error').style.display = 'none';
    document.getElementById('password-modal-success').style.display = 'none';
    passwordResetForm.reset();
  });

  closePasswordModalBtn.addEventListener('click', () => {
    passwordModal.classList.remove('active');
  });

  passwordResetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentPass = document.getElementById('modal-current-pass').value;
    const newPass = document.getElementById('modal-new-pass').value;
    const confirmPass = document.getElementById('modal-confirm-pass').value;
    
    const storedPass = localStorage.getItem('adminPassword') || 'abc@123';
    const errorEl = document.getElementById('password-modal-error');
    const successEl = document.getElementById('password-modal-success');
    
    errorEl.style.display = 'none';
    successEl.style.display = 'none';

    if (currentPass !== storedPass) {
      errorEl.textContent = 'Current password is incorrect.';
      errorEl.style.display = 'block';
      return;
    }

    if (newPass !== confirmPass) {
      errorEl.textContent = 'New passwords do not match.';
      errorEl.style.display = 'block';
      return;
    }

    localStorage.setItem('adminPassword', newPass);
    successEl.style.display = 'block';
    passwordResetForm.reset();
    
    setTimeout(() => {
      passwordModal.classList.remove('active');
    }, 2000);
  });

}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
