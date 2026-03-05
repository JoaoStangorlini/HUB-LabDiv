-- Script to create and configure feedback_reports
CREATE TABLE IF NOT EXISTS public.feedback_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    screenshot_url TEXT,
    metadata JSONB,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.feedback_reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback_reports;
CREATE POLICY "Anyone can submit feedback" ON public.feedback_reports
FOR INSERT WITH CHECK (true);

-- Allow admins to view
DROP POLICY IF EXISTS "Only admins can view feedback" ON public.feedback_reports;
CREATE POLICY "Only admins can view feedback" ON public.feedback_reports
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Allow admins to update
DROP POLICY IF EXISTS "Only admins can update feedback" ON public.feedback_reports;
CREATE POLICY "Only admins can update feedback" ON public.feedback_reports
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
