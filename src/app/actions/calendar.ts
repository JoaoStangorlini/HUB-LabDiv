'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// --- CUSTOM BLOCKS ---

export async function getCustomBlocks() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Não autenticado' };

    const { data, error } = await supabase
        .from('user_custom_blocks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data };
}

export async function addCustomBlock(title: string, duration: number) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Não autenticado' };

    const { data, error } = await supabase
        .from('user_custom_blocks')
        .insert([{ user_id: user.id, title, duration }])
        .select()
        .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data };
}

export async function deleteCustomBlock(id: string) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Não autenticado' };

    const { error } = await supabase
        .from('user_custom_blocks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

// --- CALENDAR EVENTS ---

export async function getCalendarEvents() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Não autenticado' };

    const { data, error } = await supabase
        .from('user_calendar_events')
        .select('*')
        .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };
    
    // Map database fields to FullCalendar format
    const events = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        start: item.start_time,
        end: item.end_time,
        color: item.color,
        extendedProps: {
            trail_id: item.trail_id,
            type: item.type
        }
    }));

    return { success: true, data: events };
}

export async function upsertCalendarEvent(event: any) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Não autenticado' };

    let calculatedEndTime = event.end;
    if (!calculatedEndTime) {
        // If event.end is missing (common on first drop), use duration from extendedProps, or default to 2 hours
        const durationH = event.extendedProps?.duration ? parseFloat(event.extendedProps.duration) : 2;
        calculatedEndTime = new Date(new Date(event.start).getTime() + durationH * 60 * 60 * 1000).toISOString();
    }

    const payload = {
        user_id: user.id,
        title: event.title,
        start_time: event.start,
        end_time: calculatedEndTime,
        color: event.color,
        type: event.extendedProps?.type || 'aula',
        trail_id: event.extendedProps?.trail_id || null
    };

    if (event.id && !event.id.includes('.')) { // Simple check if it's a UUID or temp ID
        const { data, error } = await supabase
            .from('user_calendar_events')
            .upsert({ id: event.id, ...payload })
            .select()
            .single();
        if (error) return { success: false, error: error.message };
        return { success: true, data };
    } else {
        const { data, error } = await supabase
            .from('user_calendar_events')
            .insert([payload])
            .select()
            .single();
        if (error) return { success: false, error: error.message };
        return { success: true, data };
    }
}

export async function deleteCalendarEvent(id: string) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Não autenticado' };

    const { error } = await supabase
        .from('user_calendar_events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };
    return { success: true };
}
