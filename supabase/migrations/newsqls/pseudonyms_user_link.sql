-- 1. Adicionar user_id à tabela de pseudônimos
ALTER TABLE public.pseudonyms ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Atualizar políticas de RLS para pseudônimos
DROP POLICY IF EXISTS "Admins can manage pseudonyms" ON public.pseudonyms;
DROP POLICY IF EXISTS "Users can view active pseudonyms" ON public.pseudonyms;

-- Admins: Acesso total
CREATE POLICY "Admins can manage all pseudonyms" 
ON public.pseudonyms 
FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Usuários: Podem ver e gerenciar os SEUS pseudônimos
CREATE POLICY "Users can manage own pseudonyms" 
ON public.pseudonyms 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid());

-- Usuários: Podem ver pseudônimos globais (sem user_id) que estão ativos
CREATE POLICY "Users can view global active pseudonyms" 
ON public.pseudonyms 
FOR SELECT 
TO authenticated 
USING (user_id IS NULL AND is_active = true);

-- 3. Garantir que event_date tenha um valor padrão se não fornecido (opcional, melhor deixar vir do form)
