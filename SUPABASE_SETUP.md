# Supabase Backend Setup Guide

This document contains all the necessary SQL scripts and steps to configure your Supabase backend for the Career Management System. 

> **Important Architecture Note regarding RLS:**
> Because your system maintains a strict separation of authentication (using Flask JWT/localStorage) and does **not** use Supabase Auth for the Admin portal, the Supabase client operates completely anonymously (`anon` role). 
> 
> Standard Row Level Security (RLS) in Supabase relies on `auth.uid()` or `auth.role() = 'authenticated'`. Since your admin is technically "anonymous" to Supabase, you have two choices for production:
> 1. **(Recommended)** Configure your Flask backend to sign custom JWTs using your Supabase JWT Secret, and pass those to the Supabase client when an Admin logs in.
> 2. **(Alternative)** For now, I have provided RLS policies below assuming standard Supabase `authenticated` vs `anon` roles. If you do not configure custom JWTs, you may need to temporarily disable RLS (or grant full `anon` access) so your Admin portal can write to the database.

---

## 1. Create Tables

Run this SQL in your Supabase SQL Editor to create the `jobs` and `applications` tables.

```sql
-- Create jobs table
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    location TEXT NOT NULL,
    experience TEXT NOT NULL,
    employment_type TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    status TEXT NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create applications table
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "applicantName" TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    resume TEXT,
    "coverLetter" TEXT,
    status TEXT NOT NULL DEFAULT 'Pending',
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for updated_at on jobs
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for updated_at on applications
CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 2. Create Indexes

Run this SQL to optimize database querying.

```sql
-- Indexes for jobs table
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC);

-- Indexes for applications table
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_created_at ON public.applications(created_at DESC);
CREATE INDEX idx_applications_job_id ON public.applications(job_id);
```

---

## 3. Create Storage Bucket

Run this SQL to create the `resumes` bucket, or create it manually via the Supabase Dashboard UI (Storage -> New Bucket).

```sql
-- Insert the bucket into the storage system
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;
```

---

## 4. Enable Row Level Security (RLS)

Run this SQL to enable RLS and set the policies. 
*(Note: As mentioned above, these assume standard `anon` (public) and `authenticated` (admin) roles).*

```sql
-- Enable RLS on tables
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- JOBS POLICIES --
-- Public can read ONLY OPEN jobs
CREATE POLICY "Public can view open jobs" 
ON public.jobs FOR SELECT 
TO anon 
USING (status = 'OPEN');

-- Admin can read ALL jobs
CREATE POLICY "Admin can view all jobs" 
ON public.jobs FOR SELECT 
TO authenticated 
USING (true);

-- Admin can insert jobs
CREATE POLICY "Admin can insert jobs" 
ON public.jobs FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Admin can update jobs
CREATE POLICY "Admin can update jobs" 
ON public.jobs FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Admin can delete jobs
CREATE POLICY "Admin can delete jobs" 
ON public.jobs FOR DELETE 
TO authenticated 
USING (true);


-- APPLICATIONS POLICIES --
-- Public can insert applications
CREATE POLICY "Public can submit applications" 
ON public.applications FOR INSERT 
TO anon 
WITH CHECK (true);

-- Admin can read all applications
CREATE POLICY "Admin can view all applications" 
ON public.applications FOR SELECT 
TO authenticated 
USING (true);

-- Admin can update applications
CREATE POLICY "Admin can update applications" 
ON public.applications FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- STORAGE BUCKET POLICIES --
-- Public can upload resumes
CREATE POLICY "Public can upload resumes"
ON storage.objects FOR INSERT 
TO anon 
WITH CHECK (bucket_id = 'resumes');

-- Public and Admin can view resumes
CREATE POLICY "Anyone can view resumes"
ON storage.objects FOR SELECT 
TO public
USING (bucket_id = 'resumes');
```

---

## 5. Insert Sample Data

Run this SQL to inject some sample data into the database to test the UI.

```sql
-- Insert Sample Jobs
INSERT INTO public.jobs (title, department, location, experience, employment_type, description, requirements, status)
VALUES 
('Senior Marine Engineer', 'Engineering', 'Mumbai, India', '5-8 Years', 'Full-time', 'Responsible for overseeing marine propulsion systems and electrical systems on large vessels.', 'B.Tech in Marine Engineering, Class 1 CoC required.', 'OPEN'),
('Welding Inspector', 'Quality Control', 'Visakhapatnam, India', '3-5 Years', 'Contract', 'Inspect and certify structural welding on ship hulls to ensure compliance with maritime safety standards.', 'CSWIP 3.1 or equivalent required.', 'CLOSED');

-- Insert Sample Applications
INSERT INTO public.applications ("applicantName", email, phone, job_id, resume, "coverLetter", status)
VALUES 
('Rahul Sharma', 'rahul.s@example.com', '+91 9876543210', (SELECT id FROM public.jobs WHERE title = 'Senior Marine Engineer' LIMIT 1), 'https://example.com/resumes/rahul.pdf', 'I have 6 years of experience in propulsion systems.', 'Pending'),
('Priya Patel', 'priya.p@example.com', '+91 8765432109', (SELECT id FROM public.jobs WHERE title = 'Welding Inspector' LIMIT 1), 'https://example.com/resumes/priya.pdf', 'Certified welding inspector with shipyard experience.', 'Shortlisted');
```

---

## 6. Testing Checklist

1. **Verify Jobs (Public):** Go to the public `/careers` page. You should only see the **"Senior Marine Engineer"** job (because the other is CLOSED).
2. **Verify Submission:** Fill out the public career form and attach a PDF. Hit apply. Check the Supabase `applications` table and `resumes` bucket to ensure the data arrived safely.
3. **Verify Dashboard (Admin):** Log into the Admin portal. Ensure the Dashboard stats accurately reflect the database (e.g., 2 Total Jobs, 1 Open, 2 Applications).
4. **Verify Management:** Go to Job Management and try editing a job or toggling its status. Ensure the database reflects the changes instantly.
