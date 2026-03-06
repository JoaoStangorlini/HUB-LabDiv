-- Adiciona a coluna category à tabela quiz_questions
ALTER TABLE public.quiz_questions ADD COLUMN IF NOT EXISTS category TEXT;

-- Atualiza as perguntas existentes para a categoria 'quiz' (categoria padrão para perguntas gerais/legado se houver)
UPDATE public.quiz_questions SET category = 'quiz' WHERE category IS NULL;

-- Torna a coluna not null
ALTER TABLE public.quiz_questions ALTER COLUMN category SET NOT NULL;
