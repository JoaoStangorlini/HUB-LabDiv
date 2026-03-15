import { createServerSupabase } from '@/lib/supabase/server';
import ArenaClient from './ArenaClient';
import { redirect } from 'next/navigation';

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
        <main className="min-h-screen pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <ArenaClient profile={profile} />
            </div>
        </main>
    );
}
