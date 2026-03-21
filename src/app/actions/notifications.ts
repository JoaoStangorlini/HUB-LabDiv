'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function fetchNotifications(userId: string) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) return [];
    return data;
}

export async function markNotificationAsRead(notificationId: string) {
    const supabase = await createServerSupabase();
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

    return { success: !error };
}

export async function getUnreadCount(userId: string) {
    const supabase = await createServerSupabase();
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    return count || 0;
}
