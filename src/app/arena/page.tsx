import { createServerSupabase } from '@/lib/supabase/server';
import ArenaClient from './ArenaClient';
import { redirect } from 'next/navigation';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';

export default async function ArenaPage() {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/entrar');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile || profile.user_category !== 'pesquisador') {
        // Only researchers have access to the Arena
        redirect('/lab');
    }

    return (
        <MainLayoutWrapper userId={user.id}>
            <div className="w-full">
                <ArenaClient profile={profile} />
            </div>
        </MainLayoutWrapper>
    );
}
