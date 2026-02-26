'use server';

import { v2 as cloudinary } from 'cloudinary';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const submissionSchema = z.object({
    submission_id: z.string().uuid(),
});

/**
 * V8.0 Rate Limiting: Simple in-memory strategy for Server Actions.
 * For high-scale production, use Redis (Upstash).
 */
const rateLimitMap = new Map<string, number[]>();
const MAX_REQUESTS = 5;
const WINDOW_MS = 10000;

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) || [];
    const validTimestamps = timestamps.filter(ts => now - ts < WINDOW_MS);

    if (validTimestamps.length >= MAX_REQUESTS) return false;

    validTimestamps.push(now);
    rateLimitMap.set(ip, validTimestamps);
    return true;
}

export async function toggleLike(formData: { submission_id: string }) {
    const validated = submissionSchema.safeParse(formData);
    if (!validated.success) return { error: 'Invalid input' };

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
                set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }); },
                remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }); },
            }
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    if (!checkRateLimit(user.id)) {
        return { error: 'Too many requests. Slow down, scientist.' };
    }

    const { data: existing } = await supabase
        .from('curtidas')
        .select('*')
        .eq('submission_id', validated.data.submission_id)
        .eq('user_id', user.id)
        .maybeSingle();

    if (existing) {
        await supabase.from('curtidas').delete().eq('id', existing.id);
    } else {
        await supabase.from('curtidas').insert({
            submission_id: validated.data.submission_id,
            user_id: user.id
        });
    }

    revalidatePath('/');
    return { success: true };
}

export async function toggleSave(formData: { submission_id: string }) {
    const validated = submissionSchema.safeParse(formData);
    if (!validated.success) return { error: 'Invalid input' };

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
                set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }); },
                remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }); },
            }
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data: existing } = await supabase
        .from('saved_items')
        .select('*')
        .eq('submission_id', validated.data.submission_id)
        .eq('user_id', user.id)
        .maybeSingle();

    if (existing) {
        await supabase.from('saved_items').delete().eq('id', existing.id);
    } else {
        await supabase.from('saved_items').insert({
            submission_id: validated.data.submission_id,
            user_id: user.id
        });
    }

    revalidatePath('/');
    return { success: true };
}

export async function generateCloudinarySignature() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
            }
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // V8.0 Point 2: Timestamp sync for Cloudinary signing
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'assets/submissions';

    // Configure Cloudinary
    cloudinary.config({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });

    const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder },
        process.env.CLOUDINARY_API_SECRET!
    );

    return {
        signature,
        timestamp,
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder
    };
}
