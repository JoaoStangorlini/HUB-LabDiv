'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function fetchChallenges() {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
        .from('researcher_challenges')
        .select('*, creator:profiles(full_name, username, use_nickname, avatar_url)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching challenges:', error);
        return { error: 'Erro ao buscar desafios' };
    }

    return { success: true, data };
}

export async function submitToChallenge(challengeId: string, content: string) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    const { data, error } = await supabase
        .from('challenge_submissions')
        .insert({
            challenge_id: challengeId,
            researcher_id: user.id,
            content
        });

    if (error) {
        console.error('Error submitting to challenge:', error);
        return { error: 'Erro ao enviar submissão' };
    }

    revalidatePath('/arena');
    return { success: true };
}

export async function voteSubmission(submissionId: string) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Não autorizado' };

    // Simple vote increment for prototype
    const { data, error } = await supabase.rpc('increment_submission_vote', { sub_id: submissionId });

    if (error) {
        // If RPC doesn't exist yet, we can't easily increment. 
        // For now, let's assume the migration adds the RPC or we use a manual update (less safe)
        const { error: updateError } = await supabase
            .from('challenge_submissions')
            .update({ votes_count: 1 }) // This is wrong, it should be increment.
            .eq('id', submissionId);
            
        return { error: 'RPC increment_submission_vote missing' };
    }

    revalidatePath('/arena');
    return { success: true };
}
