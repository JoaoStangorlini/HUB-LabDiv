-- Tabela de Mensagens para o Emaranhamento
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) NOT NULL,
    content TEXT NOT NULL,
    attachment_id TEXT, -- ID de submissão/partícula anexada
    status TEXT DEFAULT 'sent',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para mensagens
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their context messages" ON public.messages;
CREATE POLICY "Users can view their context messages" 
ON public.messages FOR SELECT 
TO authenticated 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" 
ON public.messages FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = sender_id);
