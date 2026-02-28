-- 1. Promover usuário para ADMIN
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'jorgestangorlini@gmail.com';

-- 2. Criar tabela de Pseudônimos
CREATE TABLE IF NOT EXISTS public.pseudonyms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Habilitar RLS
ALTER TABLE public.pseudonyms ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de RLS
-- Admins podem fazer tudo
CREATE POLICY "Admins can manage pseudonyms" 
ON public.pseudonyms 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Usuários comuns podem ver apenas pseudônimos ativos
CREATE POLICY "Users can view active pseudonyms" 
ON public.pseudonyms 
FOR SELECT 
TO authenticated 

-- 5. Corrigir função de XP (Evitar erro de profile_id inexistente em submissions)
CREATE OR REPLACE FUNCTION public.calculate_profile_xp()
 RETURNS trigger
 LANGUAGE plpgsql
 AS $function$
DECLARE
    points INTEGER := 0;
    v_profile_id UUID;
BEGIN
    IF (TG_TABLE_NAME = 'submissions') THEN
        v_profile_id := NEW.user_id;
    ELSIF (TG_TABLE_NAME = 'kudos') THEN
        v_profile_id := NEW.profile_id;
    END IF;

    IF (TG_TABLE_NAME = 'submissions' AND NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status <> 'aprovado')) THEN
        points := 50;
    ELSIF (TG_TABLE_NAME = 'kudos' AND TG_OP = 'INSERT') THEN
        points := 10;
    END IF;

    IF points > 0 AND v_profile_id IS NOT NULL THEN 
        UPDATE public.profiles 
        SET xp = COALESCE(xp, 0) + points, 
            level = floor((COALESCE(xp, 0) + points) / 100) + 1 
        WHERE id = v_profile_id; 
    END IF;

    RETURN NEW;
END;
$function$;

