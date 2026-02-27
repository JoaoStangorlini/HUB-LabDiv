'use server';

import { supabase } from '@/lib/supabase';
import { createServerSupabase } from '@/lib/supabase/server';
import { PostDTO, mapToPostDTO } from '@/dtos/media';
import { unstable_cache, revalidatePath } from 'next/cache';
import { SubmissionSchema } from '@/lib/validations';
import { z } from 'zod';

export interface AdminUpdate {
    status?: string;
    admin_feedback?: string | null;
    is_featured?: boolean;
    title?: string;
    authors?: string;
    category?: string;
    description?: string;
    tags?: string[];
    media_url?: string | string[];
    external_link?: string | null;
    technical_details?: string | null;
    is_priority?: boolean;
}

export interface FetchParams {
    page: number;
    limit: number;
    query: string;
    categories?: string[];
    mediaTypes?: string[];
    sort: 'recentes' | 'antigas';
    author?: string;
    is_featured?: boolean;
    year?: number;
}

export async function fetchSubmissions({ page, limit, query, categories, mediaTypes, sort, author, is_featured: featured, year }: FetchParams): Promise<{ items: { post: PostDTO }[], hasMore: boolean }> {
    let queryBuilder = supabase
        .from('submissions')
        .select('*, energy_reactions, atomic_excitation', { count: 'exact' })
        .eq('status', 'aprovado');

    if (featured) queryBuilder = queryBuilder.eq('is_featured', true);
    if (categories && categories.length > 0 && !categories.includes('Todos')) queryBuilder = queryBuilder.in('category', categories);
    if (author) queryBuilder = queryBuilder.eq('authors', author);
    if (mediaTypes && mediaTypes.length > 0) queryBuilder = queryBuilder.in('media_type', mediaTypes);
    if (year) {
        queryBuilder = queryBuilder.gte('event_date', `${year}-01-01T00:00:00Z`).lte('event_date', `${year}-12-31T23:59:59Z`);
    }

    if (query) {
        if (query.startsWith('#')) {
            const tag = query.substring(1).trim();
            if (tag) queryBuilder = queryBuilder.contains('tags', [tag]);
        } else {
            queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,authors.ilike.%${query}%`);
        }
    }

    queryBuilder = queryBuilder.order('created_at', { ascending: sort === 'antigas' });
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    queryBuilder = queryBuilder.range(from, to);

    const { data: submissions, error, count } = await queryBuilder;
    if (error || !submissions) return { items: [], hasMore: false };

    const submissionIds = submissions.map(s => s.id);

    // Optimized Counts Fetch
    const [commentCounts, saveCounts] = await Promise.all([
        supabase.from('comments').select('submission_id').in('submission_id', submissionIds).eq('status', 'aprovado'),
        supabase.from('saved_posts').select('submission_id').in('submission_id', submissionIds),
    ]);

    const commentMap: Record<string, number> = {};
    commentCounts.data?.forEach(row => commentMap[row.submission_id] = (commentMap[row.submission_id] || 0) + 1);

    const saveMap: Record<string, number> = {};
    saveCounts.data?.forEach(row => saveMap[row.submission_id] = (saveMap[row.submission_id] || 0) + 1);

    const items = submissions.map(sub => ({
        post: mapToPostDTO(sub, {
            likes: sub.like_count,
            comments: commentMap[sub.id],
            saves: saveMap[sub.id]
        })
    }));

    const hasMore = count ? from + submissions.length < count : false;
    return { items, hasMore };
}

export async function fetchTrendingSubmissions(): Promise<{ post: PostDTO }[]> {
    const { data: submissions, error } = await supabase
        .from('submissions')
        .select('*, like_count')
        .eq('status', 'aprovado')
        .order('views', { ascending: false })
        .limit(6);

    if (error || !submissions) return [];

    const submissionIds = submissions.map(s => s.id);
    const [commentCounts, saveCounts] = await Promise.all([
        supabase.from('comments').select('submission_id').in('submission_id', submissionIds).eq('status', 'aprovado'),
        supabase.from('saved_posts').select('submission_id').in('submission_id', submissionIds),
    ]);

    const commentMap: Record<string, number> = {};
    commentCounts.data?.forEach(row => commentMap[row.submission_id] = (commentMap[row.submission_id] || 0) + 1);

    const saveMap: Record<string, number> = {};
    saveCounts.data?.forEach(row => saveMap[row.submission_id] = (saveMap[row.submission_id] || 0) + 1);

    return submissions.map(sub => ({
        post: mapToPostDTO(sub, {
            likes: sub.like_count,
            comments: commentMap[sub.id],
            saves: saveMap[sub.id]
        })
    }));
}

export async function getFeaturedSubmissions(limit: number = 10): Promise<{ post: PostDTO }[]> {
    const { data: submissions, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('status', 'aprovado')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error || !submissions) return [];

    const submissionIds = submissions.map(s => s.id);
    const [commentCounts, saveCounts] = await Promise.all([
        supabase.from('comments').select('submission_id').in('submission_id', submissionIds).eq('status', 'aprovado'),
        supabase.from('saved_posts').select('submission_id').in('submission_id', submissionIds),
    ]);

    const commentMap: Record<string, number> = {};
    commentCounts.data?.forEach(row => commentMap[row.submission_id] = (commentMap[row.submission_id] || 0) + 1);

    const saveMap: Record<string, number> = {};
    saveCounts.data?.forEach(row => saveMap[row.submission_id] = (saveMap[row.submission_id] || 0) + 1);

    return submissions.map(sub => ({
        post: mapToPostDTO(sub, {
            likes: sub.like_count,
            comments: commentMap[sub.id],
            saves: saveMap[sub.id]
        })
    }));
}

export const getTrendingTags = unstable_cache(
    async () => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const { data, error } = await supabase
            .from('submissions')
            .select('tags')
            .eq('status', 'aprovado')
            .gte('created_at', oneWeekAgo.toISOString());

        if (error || !data) return [];
        const tagCounts: Record<string, number> = {};
        data.forEach(sub => sub.tags?.forEach((tag: string) => {
            const t = tag.trim();
            if (t) tagCounts[t] = (tagCounts[t] || 0) + 1;
        }));
        return Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag]) => tag);
    },
    ['trending-tags-v5'],
    { revalidate: 3600 }
);

export async function getSidebarTags() {
    const { data } = await supabase.from('submissions').select('tags').eq('status', 'aprovado').limit(100);
    const tagCounts: Record<string, number> = {};
    data?.forEach(sub => sub.tags?.forEach((tag: string) => {
        const t = tag.trim();
        if (t) tagCounts[t] = (tagCounts[t] || 0) + 1;
    }));
    return Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));
}

export async function getScientistsInOrbit() {
    const { data: profiles } = await supabase.from('profiles').select('full_name, username, avatar_url').limit(5);
    return profiles?.map(p => ({
        name: p.full_name || p.username || 'Cientista',
        handle: p.username ? `@${p.username}` : '@cientista',
        avatar: p.avatar_url,
    })) || [];
}

export async function createSubmission(formData: z.infer<typeof SubmissionSchema>) {
    console.log("Server Action: createSubmission received:", JSON.stringify(formData, null, 2));
    const validated = SubmissionSchema.safeParse(formData);

    if (!validated.success) {
        const flattened = validated.error.flatten();
        console.error("Server Action: Zod Validation Failed:", JSON.stringify(flattened.fieldErrors, null, 2));
        return {
            error: {
                ...flattened.fieldErrors,
                formErrors: flattened.formErrors
            }
        };
    }
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return { error: { auth: ["Unauthorized"] } };

    // [GOLDEN MASTER] DB Mapping & Cleaning
    const { read_guide, accepted_cc, co_authors, ...insertData } = validated.data;
    const co_author_ids = Array.isArray(co_authors)
        ? co_authors.map(u => typeof u === 'string' ? u : u.id).filter(Boolean)
        : [];

    const { data, error } = await supabase.from('submissions').insert([{
        ...insertData,
        co_author_ids,
        user_id: user.id,
        status: 'pendente'
    }]).select().single();

    if (error) {
        console.error("Server Action: DB Insert Failed:", error);
        return { error: { database: [error.message || "Erro desconhecido no banco"] } };
    }

    revalidatePath('/');
    revalidatePath('/admin/pendentes');

    return { success: true, data };
}

export async function fetchUserSubmissions(userId: string): Promise<{ post: PostDTO }[]> {
    const { data: submissions, error } = await supabase
        .from('submissions')
        .select('*, energy_reactions, atomic_excitation')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error || !submissions) return [];

    // Get counts for these submissions
    const submissionIds = submissions.map(s => s.id);
    const [commentCounts, saveCounts] = await Promise.all([
        supabase.from('comments').select('submission_id').in('submission_id', submissionIds).eq('status', 'aprovado'),
        supabase.from('saved_posts').select('submission_id').in('submission_id', submissionIds),
    ]);

    const commentMap: Record<string, number> = {};
    commentCounts.data?.forEach(row => commentMap[row.submission_id] = (commentMap[row.submission_id] || 0) + 1);

    const saveMap: Record<string, number> = {};
    saveCounts.data?.forEach(row => saveMap[row.submission_id] = (saveMap[row.submission_id] || 0) + 1);

    return submissions.map(sub => ({
        post: mapToPostDTO(sub, {
            likes: sub.like_count,
            comments: commentMap[sub.id],
            saves: saveMap[sub.id]
        })
    }));
}

export async function updateSubmissionAdmin(id: string, updates: AdminUpdate) {
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return { error: { message: 'Unauthorized' } };

    // Strict Admin Check
    const { data: profile } = await serverSupabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return { error: { message: 'Forbidden' } };

    const { data, error } = await supabase
        .from('submissions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (!error) {
        revalidatePath('/');
        revalidatePath('/admin');
        revalidatePath('/fluxo');
    }
    return { data, error };
}

export async function fetchAdminSubmissions(status: string) {
    const { data: submissions, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

    if (error || !submissions) return [];
    return submissions.map(sub => mapToPostDTO(sub));
}

export async function fetchParticlePreview(id: string) {
    const { data, error } = await supabase
        .from('submissions')
        .select('title, authors, atomic_excitation')
        .eq('id', id)
        .single();

    if (error || !data) return null;

    return {
        title: data.title,
        author: data.authors,
        energy: data.atomic_excitation || 0
    };
}
