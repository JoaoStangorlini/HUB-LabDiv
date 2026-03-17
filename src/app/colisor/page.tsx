import React from 'react';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { supabase } from '@/lib/supabase';
import { ColisorClientView } from './ColisorClientView';
import { ColisorFeedbackCard } from './ColisorFeedbackCard';

export const dynamic = 'force-dynamic';

export default async function WikiPage() {
    // Fetch Oportunidades
    const { data: oportunidades } = await supabase
        .from('oportunidades')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

    return (
        <MainLayoutWrapper rightSidebar={<ColisorFeedbackCard />}>
            <ColisorClientView oportunidades={oportunidades} />
        </MainLayoutWrapper>
    );
}
