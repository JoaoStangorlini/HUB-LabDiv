-- Migration: Create Reports Table for User Content Moderation (Feature 10)

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
    reporter_id UUID REFERENCES public.auth.users(id) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'analisado', 'ignorado')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Select policies
-- Only Admins can view reports. (Given we have admin_session, we can just allow SELECT for authenticated users here and restrict the page, or restrict via RLS if there is an admin role)
-- For simplicity, since admin is protected via middleware/cookies, we allow authenticated to read their own, or true for admin queries.
CREATE POLICY "Users can report" ON public.reports
    FOR INSERT 
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON public.reports
    FOR SELECT
    USING (auth.uid() = reporter_id);
