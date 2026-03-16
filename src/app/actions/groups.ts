'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createEntangledGroup(name: string, memberIds: string[]) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };
    if (!name.trim()) return { error: 'Nome do grupo é obrigatório' };
    if (memberIds.length < 2) return { error: 'Um grupo precisa de pelo menos 2 membros além de você' };

    // Create the group
    const { data: group, error: gError } = await supabase
        .from('entangled_groups')
        .insert({ name: name.trim(), created_by: user.id })
        .select()
        .single();

    if (gError || !group) {
        console.error('Error creating group:', gError);
        return { error: 'Erro ao criar grupo' };
    }

    // Add creator + members
    const allMembers = [user.id, ...memberIds].map(uid => ({
        group_id: group.id,
        user_id: uid
    }));

    const { error: mError } = await supabase
        .from('entangled_group_members')
        .insert(allMembers);

    if (mError) {
        console.error('Error adding members:', mError);
        // Cleanup the group
        await supabase.from('entangled_groups').delete().eq('id', group.id);
        return { error: 'Erro ao adicionar membros' };
    }

    revalidatePath('/emaranhamento');
    return { success: true, data: group };
}

export async function fetchMyGroups() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    // Get groups this user is a member of
    const { data: memberships, error: mError } = await supabase
        .from('entangled_group_members')
        .select('group_id')
        .eq('user_id', user.id);

    if (mError || !memberships?.length) return { success: true, data: [] };

    const groupIds = memberships.map(m => m.group_id);

    const { data: groups, error: gError } = await supabase
        .from('entangled_groups')
        .select('*')
        .in('id', groupIds)
        .order('updated_at', { ascending: false });

    if (gError) return { error: 'Erro ao buscar grupos' };

    // For each group, fetch members with profile info
    const enrichedGroups = await Promise.all(
        (groups || []).map(async (group) => {
            const { data: members } = await supabase
                .from('entangled_group_members')
                .select('user_id, profiles:user_id(id, full_name, username, use_nickname, avatar_url)')
                .eq('group_id', group.id);

            return {
                ...group,
                members: (members || []).map((m: any) => m.profiles)
            };
        })
    );

    return { success: true, data: enrichedGroups };
}

export async function fetchGroupMessages(groupId: string) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('group_messages')
        .select('*, sender:profiles!sender_id(id, full_name, username, use_nickname, avatar_url)')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(100);

    if (error) {
        console.error('Error fetching group messages:', error);
        return [];
    }

    return data || [];
}

export async function sendGroupMessage(groupId: string, content: string, attachmentId?: string) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };
    if (!content.trim()) return { error: 'Mensagem vazia' };

    const { error } = await supabase
        .from('group_messages')
        .insert({
            group_id: groupId,
            sender_id: user.id,
            content: content.trim(),
            attachment_id: attachmentId || null
        });

    if (error) {
        console.error('Error sending group message:', error);
        return { error: 'Erro ao enviar mensagem' };
    }

    // Update group's updated_at
    await supabase
        .from('entangled_groups')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', groupId);

    return { success: true };
}
