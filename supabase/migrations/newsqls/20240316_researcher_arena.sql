-- Migration for Researcher Challenges Arena
CREATE TABLE if not exists public.researcher_challenges (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text NOT NULL,
    deadline timestamptz NOT NULL,
    status text DEFAULT 'active', -- active, finished
    created_at timestamptz DEFAULT now()
);

CREATE TABLE if not exists public.challenge_submissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    challenge_id uuid REFERENCES public.researcher_challenges(id) ON DELETE CASCADE,
    researcher_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    votes_count int DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    UNIQUE(challenge_id, researcher_id)
);

-- RLS
ALTER TABLE public.researcher_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Researchers can view all challenges" ON public.researcher_challenges
    FOR SELECT USING (true);

CREATE POLICY "Researchers can create challenges" ON public.researcher_challenges
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_category = 'pesquisador'
        )
    );

CREATE POLICY "Researchers can view all submissions" ON public.challenge_submissions
    FOR SELECT USING (true);

CREATE POLICY "Researchers can submit to challenges" ON public.challenge_submissions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_category = 'pesquisador'
        )
    );
