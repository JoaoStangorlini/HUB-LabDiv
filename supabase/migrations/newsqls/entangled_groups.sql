-- Entangled Groups: Allow 3+ users to connect in a group chat
-- This extends the existing 1-to-1 entanglement system

-- Groups table
CREATE TABLE IF NOT EXISTS public.entangled_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Grupo Emaranhado',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Group members join table
CREATE TABLE IF NOT EXISTS public.entangled_group_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES public.entangled_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(group_id, user_id)
);

-- Group messages (reuses similar structure to messages but with group_id)
CREATE TABLE IF NOT EXISTS public.group_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES public.entangled_groups(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.entangled_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entangled_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- RLS: Users can see groups they are members of
CREATE POLICY "Users can view their groups"
    ON public.entangled_groups FOR SELECT
    USING (id IN (SELECT group_id FROM public.entangled_group_members WHERE user_id = auth.uid()));

-- RLS: Users can create groups
CREATE POLICY "Users can create groups"
    ON public.entangled_groups FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- RLS: Members view
CREATE POLICY "Users can view group members"
    ON public.entangled_group_members FOR SELECT
    USING (group_id IN (SELECT group_id FROM public.entangled_group_members WHERE user_id = auth.uid()));

-- RLS: Group creators can add members
CREATE POLICY "Users can add members to their groups"
    ON public.entangled_group_members FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- RLS: Messages view (only group members)
CREATE POLICY "Group members can view messages"
    ON public.group_messages FOR SELECT
    USING (group_id IN (SELECT group_id FROM public.entangled_group_members WHERE user_id = auth.uid()));

-- RLS: Group members can send messages
CREATE POLICY "Group members can send messages"
    ON public.group_messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        group_id IN (SELECT group_id FROM public.entangled_group_members WHERE user_id = auth.uid())
    );

-- Enable realtime for group messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;

-- Indexes
CREATE INDEX idx_group_members_group ON public.entangled_group_members(group_id);
CREATE INDEX idx_group_members_user ON public.entangled_group_members(user_id);
CREATE INDEX idx_group_messages_group ON public.group_messages(group_id);
CREATE INDEX idx_group_messages_created ON public.group_messages(created_at);
