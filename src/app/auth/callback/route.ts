import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    // Get the base site URL from env or dynamic inspection to avoid redirect loops
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
        (request.headers.get('x-forwarded-proto') ? `${request.headers.get('x-forwarded-proto')}://${request.headers.get('host')}` : null) ||
        new URL(request.url).origin;

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(`${siteUrl}${next}`);
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${siteUrl}/login?error=auth-code-error`);
}
