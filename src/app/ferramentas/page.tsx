import { createServerSupabase } from '@/lib/supabase/server';
import FerramentasClient from './FerramentasClient';
import { redirect } from 'next/navigation';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';

export default async function FerramentasPage() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile || profile.user_category !== 'aluno_usp') {
        // Only USP students have access to these tools
        redirect('/lab');
    }

    return (
        <MainLayoutWrapper userId={user.id}>
            <FerramentasClient profile={profile} />
        </MainLayoutWrapper>
    );
}
