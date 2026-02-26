'use server';

import { supabase } from '@/lib/supabase';
import { PostDTO, mapToPostDTO } from '@/dtos/media';

export async function getForYouRecommendations(userId: string | undefined): Promise<{ post: PostDTO }[]> {
    if (!userId) {
        const { data } = await supabase
            .from('submissions')
            .select('*')
            .eq('status', 'aprovado')
            .eq('is_featured', true)
            .order('created_at', { ascending: false })
            .limit(4);
        return (data || []).map(sub => ({ post: mapToPostDTO(sub) }));
    }

    const { data: history } = await supabase
        .from('reading_history')
        .select(`
            submission_id,
            submissions (*)
        `)
        .eq('user_id', userId)
        .order('last_accessed_at', { ascending: false })
        .limit(10);

    if (!history || history.length === 0) {
        const { data } = await supabase
            .from('submissions')
            .select('*')
            .eq('status', 'aprovado')
            .order('views', { ascending: false })
            .limit(4);
        return (data || []).map(sub => ({ post: mapToPostDTO(sub) }));
    }

    const categories = Array.from(new Set(history.map((h: any) => h.submissions.category).filter(Boolean)));
    const readIds = history.map((h: any) => h.submission_id);

    let query = supabase
        .from('submissions')
        .select('*')
        .eq('status', 'aprovado')
        .not('id', 'in', `(${readIds.join(',')})`);

    if (categories.length > 0) {
        query = query.in('category', categories);
    }

    const { data: recommendations, error } = await query
        .order('created_at', { ascending: false })
        .limit(4);

    if (error || !recommendations || recommendations.length < 2) {
        const { data: fallback } = await supabase
            .from('submissions')
            .select('*')
            .eq('status', 'aprovado')
            .not('id', 'in', `(${readIds.join(',')})`)
            .order('views', { ascending: false })
            .limit(4);
        return (fallback || []).map(sub => ({ post: mapToPostDTO(sub) }));
    }

    return recommendations.map(sub => ({ post: mapToPostDTO(sub) }));
}
