-- Create custom types for enum values
CREATE TYPE submission_status AS ENUM ('pendente', 'aprovado', 'rejeitado');
CREATE TYPE submission_type AS ENUM ('image', 'video');

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
  featured boolean DEFAULT false
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Policies for submissions table

-- 1. Public can view only approved submissions
CREATE POLICY "Approved submissions are viewable by everyone"
  ON submissions FOR SELECT
  USING (status = 'aprovado');

-- 2. Anyone can insert new submissions (they default to 'pendente' via DB default or check)
CREATE POLICY "Users can insert new submissions"
  ON submissions FOR INSERT
  WITH CHECK (status = 'pendente');

-- 3. Admins can view all submissions (requires authenticated role to manage)
CREATE POLICY "Admins can view all submissions"
  ON submissions FOR SELECT
  USING (auth.role() = 'authenticated');

-- 4. Admins can update submissions (e.g. approve or mark featured)
CREATE POLICY "Admins can update submissions"
  ON submissions FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 5. Admins can delete submissions (e.g. reject and remove)
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

-- Anyone can insert a like (UNIQUE constraint prevents duplicates)
CREATE POLICY "Anyone can insert curtidas"
  ON curtidas FOR INSERT
  WITH CHECK (true);

-- Anyone can read curtidas (for counting)
CREATE POLICY "Anyone can view curtidas"
  ON curtidas FOR SELECT
  USING (true);

-- Admins can delete curtidas
CREATE POLICY "Admins can delete curtidas"
  ON curtidas FOR DELETE
  USING (auth.role() = 'authenticated');

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

-- Anyone can submit a question (must be pendente)
CREATE POLICY "Anyone can insert perguntas"
  ON perguntas FOR INSERT
  WITH CHECK (status = 'pendente');

-- Public can view only answered questions
CREATE POLICY "Public can view answered perguntas"
  ON perguntas FOR SELECT
  USING (status = 'respondida');

-- Admins can view all questions
CREATE POLICY "Admins can view all perguntas"
  ON perguntas FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admins can update questions (to add answers)
CREATE POLICY "Admins can update perguntas"
  ON perguntas FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Admins can delete questions
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

-- Anyone can view opportunities
CREATE POLICY "Anyone can view oportunidades"
  ON oportunidades FOR SELECT
  USING (true);

-- Admins can insert opportunities
CREATE POLICY "Admins can insert oportunidades"
  ON oportunidades FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Admins can update opportunities
CREATE POLICY "Admins can update oportunidades"
  ON oportunidades FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Admins can delete opportunities
CREATE POLICY "Admins can delete oportunidades"
  ON oportunidades FOR DELETE
  USING (auth.role() = 'authenticated');
