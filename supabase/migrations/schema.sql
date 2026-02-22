CREATE TYPE submission_status AS ENUM ('pendente', 'aprovado', 'rejeitado');
-- Note: 'pdf' and 'text' are added for Sprint 2
CREATE TYPE submission_type AS ENUM ('image', 'video', 'pdf', 'text');

-- Create submissions table
CREATE TABLE public.submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  authors text NOT NULL,
  description text,
  media_type submission_type NOT NULL,
  media_url jsonb NOT NULL DEFAULT '[]'::jsonb,
  category text, -- e.g., 'Astronomia', 'Materiais', 'Biofísica'
  email text,
  whatsapp text,
  status submission_status DEFAULT 'pendente' NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  featured boolean DEFAULT false,
  external_link text,
  technical_details text,
  alt_text text
);

-- Performance Indexes for Submissions
CREATE INDEX idx_submissions_status_date ON public.submissions (status, created_at DESC);
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_submissions_title_trgm ON public.submissions USING GIN (title gin_trgm_ops);
CREATE INDEX idx_submissions_desc_trgm ON public.submissions USING GIN (description gin_trgm_ops);
CREATE INDEX idx_submissions_authors_trgm ON public.submissions USING GIN (authors gin_trgm_ops);

-- Set up Row Level Security (RLS)
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Policies for submissions table
CREATE POLICY "Approved submissions are viewable by everyone"
  ON submissions FOR SELECT
  USING (status = 'aprovado');

CREATE POLICY "Users can insert new submissions"
  ON submissions FOR INSERT
  WITH CHECK (status = 'pendente');

CREATE POLICY "Admins can view all submissions"
  ON submissions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update submissions"
  ON submissions FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete submissions"
  ON submissions FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create contatos table
CREATE TABLE public.contatos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  whatsapp text,
  message text NOT NULL,
  status text DEFAULT 'nova' NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Protect contatos (only authenticated can read)
ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contatos"
  ON contatos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can view contatos"
  ON contatos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update contatos"
  ON contatos FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete contatos"
  ON contatos FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- Curtidas (Likes / Engagement)
-- =============================================
CREATE TABLE public.curtidas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  fingerprint text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(submission_id, fingerprint)
);

ALTER TABLE public.curtidas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage curtidas"
  ON curtidas FOR ALL
  USING (auth.role() = 'authenticated');

-- Atomic RPC function to toggle likes safely
CREATE OR REPLACE FUNCTION toggle_like(p_submission_id UUID, p_fingerprint TEXT)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    current_count INT;
    was_liked BOOLEAN;
BEGIN
    IF EXISTS (SELECT 1 FROM curtidas WHERE submission_id = p_submission_id AND fingerprint = p_fingerprint) THEN
        DELETE FROM curtidas WHERE submission_id = p_submission_id AND fingerprint = p_fingerprint;
        was_liked := false;
    ELSE
        INSERT INTO curtidas (submission_id, fingerprint) VALUES (p_submission_id, p_fingerprint);
        was_liked := true;
    END IF;
    
    SELECT COUNT(*) INTO current_count FROM curtidas WHERE submission_id = p_submission_id;
    
    RETURN jsonb_build_object(
      'liked', was_liked,
      'count', current_count
    );
END;
$$;

-- =============================================
-- Perguntas (Ask a Scientist)
-- =============================================
CREATE TABLE public.perguntas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  email text NOT NULL,
  pergunta text NOT NULL,
  resposta text,
  status text DEFAULT 'pendente' NOT NULL,
  respondido_por text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.perguntas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert perguntas"
  ON perguntas FOR INSERT
  WITH CHECK (status = 'pendente');

CREATE POLICY "Public can view answered perguntas"
  ON perguntas FOR SELECT
  USING (status = 'respondida');

CREATE POLICY "Admins can view all perguntas"
  ON perguntas FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update perguntas"
  ON perguntas FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete perguntas"
  ON perguntas FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================
-- Oportunidades (Dynamic Opportunities Board)
-- =============================================
CREATE TABLE public.oportunidades (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo text NOT NULL,
  descricao text NOT NULL,
  data text NOT NULL,
  local text NOT NULL,
  link text,
  tipo text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.oportunidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view oportunidades"
  ON oportunidades FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage oportunidades"
  ON oportunidades FOR ALL
  USING (auth.role() = 'authenticated');

-- =============================================
-- Comments (Academic Feedback) - SPRINT 4 READY
-- =============================================
CREATE TABLE public.comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  content text NOT NULL,
  status text DEFAULT 'pendente' NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved comments" ON public.comments FOR SELECT USING (status = 'aprovado');
CREATE POLICY "Anyone can insert comments" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage comments" ON public.comments FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- SPRINT 4 MIGRATION SNIPPET (For existing databases)
-- =============================================
-- ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS status text DEFAULT 'pendente' NOT NULL;
-- ALTER TABLE public.contatos ADD COLUMN IF NOT EXISTS status text DEFAULT 'nova' NOT NULL;
-- DROP POLICY IF EXISTS "Only admins can view contatos" ON public.contatos;
-- CREATE POLICY "Only admins can view contatos" ON public.contatos FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "Admins can update contatos" ON public.contatos FOR UPDATE USING (auth.role() = 'authenticated');