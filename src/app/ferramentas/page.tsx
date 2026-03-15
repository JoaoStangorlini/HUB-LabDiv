import { createServerSupabase } from '@/lib/supabase/server';
import FerramentasClient from './FerramentasClient';
import { redirect } from 'next/navigation';

export default async function FerramentasPage() {
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

    if (!profile || profile.user_category !== 'aluno_usp') {
        // Only USP students have access to these tools
        redirect('/lab');
    }

    return (
        <main className="min-h-screen pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <FerramentasClient profile={profile} />
            </div>
        </main>
    );
}
