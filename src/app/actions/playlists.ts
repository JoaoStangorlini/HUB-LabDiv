'use server';

import { supabase } from '@/lib/supabase';
import { MediaCardProps } from '@/components/MediaCard';

export interface Playlist {
    id: string;
    title: string;
    description: string;
    slug: string;
    created_at: string;
}

export async function fetchPlaylists(): Promise<Playlist[]> {
    const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching playlists:', error);
        return [];
    }
    return data || [];
}

export async function fetchPlaylistBySlug(slug: string): Promise<Playlist | null> {
    const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error(`Error fetching playlist ${slug}:`, error);
        return null;
    }
    return data;
}

export async function fetchPlaylistItems(playlistId: string): Promise<MediaCardProps[]> {
    const { data, error } = await supabase
        .from('playlist_items')
        .select(`
            position,
            submissions (id, title, description, authors, media_type, media_url, category, featured, external_link, created_at, technical_details, alt_text, tags, views, reading_time, like_count, status)
        `)
        .eq('playlist_id', playlistId)
        // Ensure we only fetch approved submissions
        .eq('submissions.status', 'aprovado')
        .order('position', { ascending: true });

    if (error) {
        console.error('Error fetching playlist items:', error);
        return [];
    }

    // Filter out potential nulls if a submission was deleted or isn't approved
    const submissions = data
        .map(item => item.submissions)
        .filter(sub => sub !== null) as any[];

    if (submissions.length === 0) return [];

    return submissions.map(sub => ({
        id: sub.id,
        title: sub.title,
        description: sub.description,
        authors: sub.authors,
        mediaType: sub.media_type,
        mediaUrl: sub.media_url,
        category: sub.category,
        isFeatured: sub.featured,
        likeCount: sub.like_count || 0,
        external_link: sub.external_link || null,
        created_at: sub.created_at,
        technical_details: sub.technical_details || null,
        alt_text: sub.alt_text || null,
        tags: sub.tags || [],
        views: sub.views || 0,
        reading_time: sub.reading_time || 0
    }));
}
