'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { Header } from '@/components/layout/Header';
import { getProfileById, fetchRecentEntanglements } from '@/app/actions/submissions';
import { ParticleEntanglement } from '@/components/engagement/ParticleEntanglement';
import { User, Loader2, MessageSquare, Network } from 'lucide-react';

export default function EmaranhamentoPage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId') || searchParams.get('userID');
    const [targetProfile, setTargetProfile] = useState<any>(null);
    const [recentConversations, setRecentConversations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRecentLoading, setIsRecentLoading] = useState(false);

    useEffect(() => {
        if (userId) {
            setIsLoading(true);
            getProfileById(userId)
                .then(setTargetProfile)
                .finally(() => setIsLoading(false));
        } else {
            setTargetProfile(null);
            // Load recent ones to show in the center
            setIsRecentLoading(true);
            fetchRecentEntanglements()
                .then(setRecentConversations)
                .finally(() => setIsRecentLoading(false));
        }
    }, [userId]);

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen">
            <Header />
            <MainLayoutWrapper userId={userId || undefined}>
                <div className="flex flex-col lg:flex-row gap-8 py-8 h-[calc(100vh-120px)]">
                    {/* Active Chat Column */}
                    <div className="flex-1 flex flex-col min-h-0">
                        {isLoading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                            </div>
                        ) : targetProfile ? (
                            <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Chat Header Info */}
                                <div className="mb-4 flex items-center gap-4 px-6 py-4 bg-white/5 rounded-[24px] border border-white/5">
                                    {targetProfile.avatar ? (
                                        <img src={targetProfile.avatar} className="size-12 rounded-full object-cover border-2 border-brand-blue" />
                                    ) : (
                                        <div className="size-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                                            <User className="w-6 h-6" />
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">{targetProfile.name}</h2>
                                        <span className="text-[10px] text-brand-blue font-bold uppercase tracking-widest">Conexão Ativa</span>
                                    </div>
                                </div>
                                <div className="flex-1 min-h-0">
                                    <ParticleEntanglement recipientId={targetProfile.id} />
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white/5 rounded-[32px] border border-dashed border-white/10 overflow-y-auto">
                                <div className="size-20 rounded-full bg-brand-blue/10 flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-4xl text-brand-blue">hub</span>
                                </div>
                                <h2 className="text-xl font-display font-black text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Interface de Emaranhamento</h2>
                                <p className="text-xs text-gray-500 max-w-sm mb-8 leading-relaxed text-center">
                                    Inicie conexões neurais com outros usuários ou retome uma de suas **Conversas Ativas** abaixo.
                                </p>

                                {isRecentLoading ? (
                                    <Loader2 className="w-6 h-6 text-brand-blue/20 animate-spin" />
                                ) : recentConversations.length > 0 ? (
                                    <div className="w-full max-w-md space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue mb-4 text-center">Minhas Conversas Ativas</h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {recentConversations.map((conv) => (
                                                <button
                                                    key={conv.id}
                                                    onClick={() => window.location.href = `/emaranhamento?userId=${conv.id}`}
                                                    className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-left"
                                                >
                                                    <div className="shrink-0 relative">
                                                        {conv.avatar ? (
                                                            <img src={conv.avatar} alt={conv.name} className="size-10 rounded-full object-cover" />
                                                        ) : (
                                                            <div className="size-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-black uppercase">
                                                                {conv.name[0]}
                                                            </div>
                                                        )}
                                                        <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-brand-blue border-2 border-[#1E1E1E] rounded-full" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="text-xs font-black text-white uppercase truncate">{conv.name}</span>
                                                        <span className="text-[10px] text-gray-400 italic truncate opacity-80">{conv.lastMessage || conv.handle}</span>
                                                    </div>
                                                    <span className="material-symbols-outlined text-brand-blue/40 text-sm">arrow_forward</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => window.location.href = '/'}
                                        className="px-8 py-3 bg-brand-blue text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-brand-blue/20"
                                    >
                                        Voltar ao Fluxo
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Mini Info / Guidelines (Optional/Placeholder) */}
                    <div className="hidden xl:flex w-[280px] flex-col gap-6">
                        <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-[32px] p-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue mb-4">Protocolo de Emaranhamento</h3>
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <span className="material-symbols-outlined text-sm text-brand-blue">science</span>
                                    <p className="text-[10px] text-gray-400 font-medium italic">Troque referências técnicas para aumentar sua Excitação Atômica.</p>
                                </li>
                                <li className="flex gap-3">
                                    <span className="material-symbols-outlined text-sm text-brand-blue">link</span>
                                    <p className="text-[10px] text-gray-400 font-medium italic">Anexe partículas do Colisor para facilitar a análise.</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </MainLayoutWrapper>
        </div>
    );
}
