# Career Module Architecture

This document describes the completely refactored, Supabase-backed architecture for the Careers module.

## 1. File Structure

```text
static/js/
├── config/
│   └── supabase.js             # Supabase client initialization using window.SUPABASE_URL
├── services/
│   ├── JobService.js           # Handles Job CRUD operations (Supabase 'jobs' table)
│   ├── ApplicationService.js   # Handles Application submissions & Resume uploads
│   └── DashboardService.js     # Handles aggregate stats for Admin Dashboard
├── utils/
│   ├── validation.js           # Form, email, phone, and file validations
│   ├── notifications.js        # Custom Toast notification system
│   └── loading.js              # Dynamic loading spinners and empty states
└── career/
    ├── public.js               # UI logic for the public /careers page
    └── admin.js                # UI logic for the Admin Careers portal
```

## 2. Service Responsibilities

### `JobService`
- Fetches all jobs for the admin portal.
- Fetches only `OPEN` jobs for the public careers page.
- Handles creating, updating, deleting, and toggling job statuses.
- **Returns:** `{ success: boolean, data?: any, message?: string, error?: any }`

### `ApplicationService`
- **Uploads Resumes:** Validates file type (PDF/DOC) and size (<5MB), uploads to the Supabase `resumes` bucket, and retrieves the public URL.
- **Submits Applications:** Inserts the candidate's details along with the `job_id` (foreign key) and `resume` (public URL).
- **Retrieves Applications:** Joins the `jobs` table to fetch the job title so the UI doesn't have to duplicate data.
- **Returns:** `{ success: boolean, data?: any, message?: string, error?: any }`

### `DashboardService`
- Instead of downloading all records into memory, this service uses Supabase aggregate functions (`{ count: 'exact', head: true }`) to compute Dashboard statistics.
- **Methods:** `getTotalJobs`, `getOpenJobs`, `getClosedJobs`, `getTotalApplications`, `getRecentApplications`.

### `Utils`
- Kept separate to ensure UI files (`admin.js`, `public.js`) remain strictly focused on DOM manipulation.
- **Notifications:** Replaces native browser `alert()` with styled, temporary Toast notifications injected directly into the DOM.
- **Loading:** Injects CSS-animated spinners while Supabase resolves async requests.

## 3. Data Flow

### Public Career Page Flow
1. `public.js` calls `JobService.getOpenJobs()`. `LoadingUtils` shows a spinner.
2. If successful, jobs are rendered. If empty, `LoadingUtils.showEmptyState` is triggered.
3. User clicks "Apply Now" -> The job's `id` is stored in the hidden form field.
4. On submit, `ValidationUtils` checks the form.
5. `ApplicationService.uploadResume()` uploads the file to the `resumes` bucket and gets the URL.
6. `ApplicationService.submitApplication()` saves the candidate data with the `job_id` and resume URL.
7. `NotificationUtils` alerts success, and the UI shows the success panel.

### Admin Dashboard Flow
1. Admin enters credentials -> validated by `localStorage` (Flask independent).
2. `admin.js` calls `DashboardService` methods concurrently using `Promise.all`.
3. The dashboard UI updates with the aggregate totals.

### Job Management Flow
1. Admin navigates to Jobs -> `JobService.getAllJobs()` runs.
2. Form submission -> `ValidationUtils` checks required fields.
3. Data is sent to `JobService.createJob` or `JobService.updateJob`.
4. Deletion is protected by a `window.confirm()` dialog.

### Application Management Flow
1. Admin navigates to Applications -> `ApplicationService.getApplications()` runs, returning joined `jobs(title)`.
2. Changing the `<select>` triggers `ApplicationService.updateApplicationStatus()`, which immediately updates the row badge via CSS classes on success.
3. Resumes are accessed directly via the Supabase Public URL linked in the table.
