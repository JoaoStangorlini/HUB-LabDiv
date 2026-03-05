'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitFeedback(formData: FormData) {
    const supabase = await createServerSupabase();

    const type = formData.get('type') as string;
    const description = formData.get('description') as string;
    const file = formData.get('screenshot') as File | null;
    const userEmail = formData.get('email') as string | '';

    let screenshot_url = null;

    if (file && file.size > 0) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `reports/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('reports')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading screenshot:', uploadError);
        } else {
            const { data: { publicUrl } } = supabase.storage
                .from('reports')
                .getPublicUrl(filePath);
            screenshot_url = publicUrl;
        }
    }

    const { data, error } = await supabase
        .from('feedback_reports')
        .insert([
            {
                type,
                description,
                screenshot_url,
                metadata: {
                    user_email: userEmail,
                    user_agent: formData.get('user_agent'),
                    url: formData.get('url')
                }
            }
        ]);

    if (error) {
        console.error('Error submitting feedback:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/reports');
    return { success: true };
}
