-- Protocol Síncrotron v4.20: Add Equivalency Map column
ALTER TABLE public.learning_trails 
ADD COLUMN IF NOT EXISTS equivalency_map jsonb DEFAULT '{}'::jsonb;
