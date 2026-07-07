import { JobService } from '../services/JobService.js';
import { ApplicationService } from '../services/ApplicationService.js';
document.addEventListener('DOMContentLoaded', async () => {

  const jobsContainer = document.getElementById('dynamic-jobs-container');
  const formPanel = document.getElementById('form-panel');
  const careerForm = document.getElementById('career-form');
  const resultPanel = document.getElementById('result-panel');
  const positionSelect = document.getElementById('cf-position');
  
  // Create an empty state container if not exists
  if (!document.getElementById('empty-jobs-state')) {
    const emptyState = document.createElement('div');
    emptyState.id = 'empty-jobs-state';
    emptyState.style.display = 'none';
    emptyState.style.border = '1px solid #ddd';
    emptyState.style.padding = '4rem 2rem';
    emptyState.style.background = '#fff';
    emptyState.style.borderRadius = '12px';
    emptyState.style.textAlign = 'center';
    emptyState.style.marginBottom = '2.5rem';
    emptyState.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">💼</div>
      <h3 style="color: var(--primary-navy); font-size: 1.5rem; margin-bottom: 1rem;">We're currently not hiring.</h3>
      <p style="color: var(--text-light); font-size: 1.05rem;">Please check back later for future opportunities.</p>
    `;
    jobsContainer.parentNode.insertBefore(emptyState, jobsContainer);
  }

  // Load Open Jobs
  const jobs = await JobService.getOpenJobs();
  const emptyState = document.getElementById('empty-jobs-state');

  if (jobs.length === 0) {
    jobsContainer.style.display = 'none';
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
    jobsContainer.style.display = 'grid';
    jobsContainer.style.gridTemplateColumns = '1fr 1fr';
    jobsContainer.style.gap = '2rem';
    jobsContainer.style.marginBottom = '2.5rem';
    
    // Clear static select options except the first
    positionSelect.innerHTML = '<option value="">Select a position</option>';

    jobs.forEach(job => {
      // Add to select dropdown
      const opt = document.createElement('option');
      opt.value = job.title;
      opt.textContent = job.title;
      positionSelect.appendChild(opt);

      // Render Job Card
      const card = document.createElement('div');
      card.style.border = '1px solid #ddd';
      card.style.background = '#fff';
      card.style.padding = '1.5rem';
      card.style.borderRadius = '12px';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
      
      card.innerHTML = `
        <div style="flex: 1;">
          <h3 style="color: var(--primary-navy, #12254a); font-size: 1.4rem; font-weight: 600; margin-bottom: 0.5rem; text-transform: capitalize;">${job.title}</h3>
          <span style="background: #f3f4f6; color: #374151; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; display: inline-block; margin-bottom: 1.5rem;">${job.department}</span>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem; color: var(--text-light); font-size: 0.9rem;">
            <div><span style="color: var(--accent-red);">📍</span> ${job.location}</div>
            <div><span style="color: #6366f1;">💼</span> ${job.employmentType}</div>
            <div><span style="color: #8b5cf6;">⏱️</span> ${job.experience}</div>
          </div>
          
          <p style="color: #333; font-size: 1.05rem; line-height: 1.7; margin-bottom: 1.5rem;">
            ${job.description}
          </p>
        </div>
        <button class="apply-btn" data-title="${job.title}" style="width: 100%; padding: 0.75rem; background-color: var(--primary-navy, #12254a); color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; margin-top: auto; font-family: var(--font-primary);">Apply Now</button>
      `;
      jobsContainer.appendChild(card);
    });

    // Handle Apply Now clicks
    document.querySelectorAll('.apply-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const title = e.target.getAttribute('data-title');
        positionSelect.value = title;
        // Open modal instead of scrolling
        document.getElementById('application-modal-overlay').style.display = 'flex';
      });
    });
    
    // Handle close modal button
    const closeBtn = document.getElementById('close-modal-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.getElementById('application-modal-overlay').style.display = 'none';
      });
    }

    const closeResultBtn = document.getElementById('btn-close-result');
    if (closeResultBtn) {
      closeResultBtn.addEventListener('click', () => {
        document.getElementById('application-modal-overlay').style.display = 'none';
        
        // reset form view
        formPanel.style.display = 'block';
        resultPanel.style.display = 'none';
        careerForm.reset();
      });
    }
  }

  // Rewrite form submission logic to save to ApplicationService
  // instead of just generating PDF.
  // We will intercept the button click or form submit.
  
  // Note: Since careers.html has a button with onclick="handleGenerate()", 
  // we will override it here.
  const submitBtn = document.getElementById('cf-submit-btn');
  if (submitBtn) {
    // Remove the onclick attribute from HTML to avoid conflicts
    submitBtn.removeAttribute('onclick');
    submitBtn.textContent = 'Apply';
    
    submitBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const val = (id) => document.getElementById(id) ? document.getElementById(id).value.trim() : '';
      
      // Basic validation
      const requiredIds = ['cf-name', 'cf-phone', 'cf-email', 'cf-position', 'cf-exp', 'cf-qual', 'cf-resume'];
      let valid = true;
      requiredIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el || !val(id)) {
          if(el) el.style.borderColor = '#e1565a';
          valid = false;
        } else {
          el.style.borderColor = '';
        }
      });
      
      const terms = document.getElementById('cf-terms');
      if (terms && !terms.checked) {
        alert('Please agree to the Terms & Conditions to proceed.');
        return;
      }
      
      if (!valid) {
        alert('Please fill in all required fields (marked with *).');
        return;
      }
      
      submitBtn.textContent = 'Applying...';
      submitBtn.disabled = true;
      
      try {
        const resumeInput = document.getElementById('cf-resume');
        let resumeUrl = 'resume_attached.pdf'; // Fallback
        
        if (resumeInput.files.length > 0) {
          const file = resumeInput.files[0];
          try {
             resumeUrl = await ApplicationService.uploadResume(file);
          } catch (uploadErr) {
             console.error('Failed to upload resume, falling back to name', uploadErr);
             resumeUrl = file.name;
          }
        }

        await ApplicationService.submitApplication({
          applicantName: val('cf-name'),
          email: val('cf-email'),
          phone: val('cf-phone'),
          jobRole: val('cf-position'),
          resume: resumeUrl, 
          coverLetter: val('cf-skills') // Reusing skills field as cover letter proxy
        });
        
        // Use existing result panel logic
        formPanel.style.display = 'none';
        resultPanel.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
      } catch (err) {
        console.error(err);
        alert('Failed to submit application.');
        submitBtn.textContent = 'Apply';
        submitBtn.disabled = false;
      }
    });
  }
});
