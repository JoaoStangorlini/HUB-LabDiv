'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface Profile {
    id: string;
    full_name: string;
    email: string;
    institute: string;
    role: string;
    review_status: string;
    bio: string;
    is_usp_member: boolean;
    created_at: string;
}

export default function ProfileApprovalPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfiles = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('review_status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error("Erro ao carregar perfis.");
        } else {
            setProfiles(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const handleAction = async (id: string, status: 'approved' | 'rejected') => {
        const { error } = await supabase
            .from('profiles')
            .update({ review_status: status })
            .eq('id', id);

        if (error) {
            toast.error("Erro ao processar ação.");
        } else {
            toast.success(status === 'approved' ? "Perfil aprovado!" : "Perfil rejeitado.");
            setProfiles(prev => prev.filter(p => p.id !== id));
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-display font-bold text-white tracking-tight">
                    Aprovação de <span className="text-[#0055ff]">Perfis</span>
                </h1>
                <p className="text-gray-400 mt-1">Revise os novos cadastros para garantir a integridade da rede.</p>
            </header>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <span className="material-symbols-outlined text-4xl animate-spin text-[#0055ff]">progress_activity</span>
                </div>
            ) : profiles.length === 0 ? (
                <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                    <span className="material-symbols-outlined text-5xl text-gray-600 mb-4">person_off</span>
                    <p className="text-gray-500 font-medium">Nenhum perfil pendente para revisão.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {profiles.map(profile => (
                        <div key={profile.id} className="bg-card-dark border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-white">{profile.full_name || 'Sem Nome'}</h3>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${profile.is_usp_member ? 'bg-brand-blue/20 text-brand-blue' : 'bg-gray-800 text-gray-400'}`}>
                                        {profile.is_usp_member ? 'Membro USP' : 'Curioso'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{profile.bio || 'Sem biografia fornecida.'}</p>
                                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">apartment</span>
                                        {profile.institute || 'N/A'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">mail</span>
                                        {profile.email}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-3 shrink-0">
                                <button
                                    onClick={() => handleAction(profile.id, 'rejected')}
                                    className="px-6 py-2.5 rounded-2xl bg-brand-red/10 text-brand-red font-bold text-sm hover:bg-brand-red/20 transition-all"
                                >
                                    Rejeitar
                                </button>
                                <button
                                    onClick={() => handleAction(profile.id, 'approved')}
                                    className="px-6 py-2.5 rounded-2xl bg-[#0055ff] text-white font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                                >
                                    Aprovar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
