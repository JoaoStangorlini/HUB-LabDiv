import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function generateFingerprint(request: NextRequest): string {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const raw = `${ip}::${userAgent}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return hash.toString(36);
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const submission_id = searchParams.get('submission_id');

        if (!submission_id) {
            return NextResponse.json({ error: 'submission_id is required' }, { status: 400 });
        }

        const fingerprint = generateFingerprint(request);

        const { data: existing } = await supabase
            .from('curtidas')
            .select('id')
            .eq('submission_id', submission_id)
            .eq('fingerprint', fingerprint)
            .maybeSingle();

        return NextResponse.json({
            reaction: !!existing
        });

    } catch (error: unknown) {
        console.error('User reaction check error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
