'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { triggerNotification } from '@/lib/notifications';

export async function createDrop(content: string) {
    const supabase = await createServerSupabase();
    
    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Você precisa estar logado para postar.' };

    // 2. Insert Drop
    const { data: drop, error } = await supabase
        .from('micro_articles')
        .insert({
            author_id: user.id,
            content: content.trim(),
            status: 'pending'
        })
        .select(`
            *,
            profiles:author_id (
                username
            )
        `)
        .single();

    if (error) {
        console.error('Error creating drop:', error);
        return { error: 'Erro ao salvar o log no banco de dados.' };
    }

    // 3. Trigger Email Notification (Non-blocking)
    try {
        const username = (drop.profiles as any)?.username || user.email?.split('@')[0] || 'membro';
        
        // We use a safe import or the lib directly since we are on server side
        const { sendAdminNotification } = await import('@/lib/notifications');
        await sendAdminNotification({
            type: 'drop_submission',
            content: content.trim(),
            userName: username
        });
    } catch (notifyError) {
        console.error('Failed to send drop notification email:', notifyError);
    }

    revalidatePath('/drops');
    revalidatePath('/admin/drops');
    
    return { success: true, data: drop };
}
