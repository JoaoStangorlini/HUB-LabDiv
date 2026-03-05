import { createServerSupabase } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    // Robust Origin Detection: Prevents internal server IPs (0.0.0.0) from leaking in hosted envs
    const getPublicOrigin = () => {
        const host = request.headers.get('x-forwarded-host') || request.nextUrl.host;
        const proto = request.headers.get('x-forwarded-proto') || 'https';
        // If it's local development on a specific port, this handles it via request.nextUrl.origin fallback
        // but prioritized x-forwarded headers for production accuracy.
        if (host.includes('localhost') || host.includes('0.0.0.0') || host.includes('127.0.0.1')) {
            return request.nextUrl.origin;
        }
        return `${proto}://${host}`;
    };

    const publicOrigin = getPublicOrigin();

    if (code) {
        const supabase = await createServerSupabase();
        const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && session) {
            const track = searchParams.get('track');
            const email = session.user.email || '';
            const isUspDomain = email.endsWith('@usp.br') || email.endsWith('@alumni.usp.br');

            if (track === 'usp' && !isUspDomain) {
                console.warn(`Auth Conflict: Non-USP email attempted USP login: ${email}`);
                const conflictUrl = new URL('/login', publicOrigin);
                conflictUrl.searchParams.set('conflict', 'true');
                conflictUrl.searchParams.set('email', email);
                conflictUrl.searchParams.set('next', next);
                return NextResponse.redirect(conflictUrl.toString());
            }

            await supabase
                .from('profiles')
                .update({ is_usp_member: isUspDomain })
                .eq('id', session.user.id);

            console.log(`Auth Success: Redirecting to ${next} via ${publicOrigin}`);
            const redirectUrl = new URL(next, publicOrigin);
            return NextResponse.redirect(redirectUrl.toString());
        }
        console.error('Auth callback: Code exchange failed or no session', error);
    }

    const errorUrl = new URL('/login', publicOrigin);
    errorUrl.searchParams.set('error', 'auth-code-error');
    return NextResponse.redirect(errorUrl.toString());
}

