-- =====================================================================
-- Patel Engineering Works - Supabase Careers Module Schema
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Create Tables
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- 2. Create Triggers for updated_at
-- ---------------------------------------------------------------------
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

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------
-- 3. Create Indexes
-- ---------------------------------------------------------------------
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC);

CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_created_at ON public.applications(created_at DESC);
CREATE INDEX idx_applications_job_id ON public.applications(job_id);

-- ---------------------------------------------------------------------
-- 4. Create Storage Bucket
-- ---------------------------------------------------------------------
-- Insert the bucket into the storage system
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- 5. Enable Row Level Security (RLS)
-- ---------------------------------------------------------------------
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- JOBS POLICIES
CREATE POLICY "Public can view open jobs" 
ON public.jobs FOR SELECT 
TO anon 
USING (status = 'OPEN');

CREATE POLICY "Admin can view all jobs" 
ON public.jobs FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admin can insert jobs" 
ON public.jobs FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Admin can update jobs" 
ON public.jobs FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Admin can delete jobs" 
ON public.jobs FOR DELETE 
TO authenticated 
USING (true);

-- APPLICATIONS POLICIES
CREATE POLICY "Public can submit applications" 
ON public.applications FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "Admin can view all applications" 
ON public.applications FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admin can update applications" 
ON public.applications FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- STORAGE BUCKET POLICIES
CREATE POLICY "Public can upload resumes"
ON storage.objects FOR INSERT 
TO anon 
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Anyone can view resumes"
ON storage.objects FOR SELECT 
TO public
USING (bucket_id = 'resumes');

-- ---------------------------------------------------------------------
-- 6. Insert Sample Data
-- ---------------------------------------------------------------------
INSERT INTO public.jobs (title, department, location, experience, employment_type, description, requirements, status)
VALUES 
('Senior Marine Engineer', 'Engineering', 'Mumbai, India', '5-8 Years', 'Full-time', 'Responsible for overseeing marine propulsion systems and electrical systems on large vessels.', 'B.Tech in Marine Engineering, Class 1 CoC required.', 'OPEN'),
('Welding Inspector', 'Quality Control', 'Visakhapatnam, India', '3-5 Years', 'Contract', 'Inspect and certify structural welding on ship hulls to ensure compliance with maritime safety standards.', 'CSWIP 3.1 or equivalent required.', 'CLOSED');

INSERT INTO public.applications ("applicantName", email, phone, job_id, resume, "coverLetter", status)
VALUES 
('Rahul Sharma', 'rahul.s@example.com', '+91 9876543210', (SELECT id FROM public.jobs WHERE title = 'Senior Marine Engineer' LIMIT 1), 'https://example.com/resumes/rahul.pdf', 'I have 6 years of experience in propulsion systems.', 'Pending'),
('Priya Patel', 'priya.p@example.com', '+91 8765432109', (SELECT id FROM public.jobs WHERE title = 'Welding Inspector' LIMIT 1), 'https://example.com/resumes/priya.pdf', 'Certified welding inspector with shipyard experience.', 'Shortlisted');
