-- Create adoptions table
CREATE TABLE IF NOT EXISTS public.adoptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    freshman_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(mentor_id, freshman_id)
);

-- Enable RLS
ALTER TABLE public.adoptions ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admins can do everything
CREATE POLICY "Admins have full access to adoptions" ON public.adoptions
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Mentors can view and create their own requests
CREATE POLICY "Mentors can view their own adoption requests" ON public.adoptions
    FOR SELECT TO authenticated
    USING (mentor_id = auth.uid());

CREATE POLICY "Mentors can create adoption requests" ON public.adoptions
    FOR INSERT TO authenticated
    WITH CHECK (mentor_id = auth.uid());

-- Freshmen can view requests related to them
CREATE POLICY "Freshmen can view adoption requests related to them" ON public.adoptions
    FOR SELECT TO authenticated
    USING (freshman_id = auth.uid());

-- Update timestamp on change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_adoptions_updated_at
BEFORE UPDATE ON public.adoptions
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
