-- Migration: Feedback System (Panic Button) V3.1.0
-- Description: Table for bug reports/suggestions and storage for evidence.

-- 1. Create feedback_reports table
CREATE TABLE IF NOT EXISTS public.feedback_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('bug', 'suggestion', 'visual')),
    description TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    screenshot_url TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.feedback_reports ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Anyone authenticated can submit feedback
CREATE POLICY "Anyone can submit feedback" 
ON public.feedback_reports 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Only admins can view feedback
CREATE POLICY "Only admins can view feedback" 
ON public.feedback_reports 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 4. Storage Bucket: 'reports'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Authenticated users can upload reports"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Public can view reports"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'reports');
