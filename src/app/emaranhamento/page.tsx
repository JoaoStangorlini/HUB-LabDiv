'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { Header } from '@/components/layout/Header';
import { getProfileById, fetchRecentEntanglements } from '@/app/actions/submissions';
import { searchUsersByName } from '@/app/actions/profiles';
import { ParticleEntanglement } from '@/components/engagement/ParticleEntanglement';
import { User, Loader2, Search, X, Users } from 'lucide-react';

export default function EmaranhamentoPage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId') || searchParams.get('userID');
    const [targetProfile, setTargetProfile] = useState<any>(null);
    const [recentConversations, setRecentConversations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRecentLoading, setIsRecentLoading] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (userId) {
            setIsLoading(true);
            getProfileById(userId)
                .then(setTargetProfile)
                .finally(() => setIsLoading(false));
        } else {
            setTargetProfile(null);
            setIsRecentLoading(true);
            fetchRecentEntanglements()
                .then(setRecentConversations)
                .finally(() => setIsRecentLoading(false));
        }
    }, [userId]);

    // Debounced search
    useEffect(() => {
        if (!searchQuery || searchQuery.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearching(true);
            const res = await searchUsersByName(searchQuery);
            if (res.data) setSearchResults(res.data);
            setIsSearching(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'pesquisador': return 'text-brand-yellow bg-brand-yellow/10 border-brand-yellow/30';
            case 'aluno_usp': return 'text-brand-blue bg-brand-blue/10 border-brand-blue/30';
            default: return 'text-brand-red bg-brand-red/10 border-brand-red/30';
        }
    };

    const getCategoryLabel = (cat: string) => {
        switch (cat) {
            case 'pesquisador': return 'Pesquisador';
            case 'aluno_usp': return 'Aluno USP';
            default: return 'Curioso';
        }
    };

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

                                {/* ===== USER SEARCH ===== */}
                                <div className="w-full max-w-md mb-8">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue mb-3 flex items-center gap-2 justify-center">
                                        <Search className="w-3 h-3" /> Buscar Usuário para Emaranhar
                                    </label>
                                    <div className="relative mt-2">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Digite o nome do usuário..."
                                            className="w-full pl-11 pr-10 py-3 rounded-2xl font-mono text-sm bg-white/5 text-white border border-white/10 outline-none focus:border-brand-blue/50 focus:shadow-[0_0_15px_rgba(0,163,255,0.15)] transition-all placeholder:text-gray-500"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Search Results */}
                                    {isSearching && (
                                        <div className="mt-3 flex justify-center">
                                            <Loader2 className="w-5 h-5 text-brand-blue animate-spin" />
                                        </div>
                                    )}
                                    {!isSearching && searchResults.length > 0 && (
                                        <div className="mt-3 space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                            {searchResults.map((user) => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => window.location.href = `/emaranhamento?userId=${user.id}`}
                                                    className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-brand-blue/10 rounded-xl border border-white/5 hover:border-brand-blue/30 transition-all text-left group"
                                                >
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt={user.full_name} className="size-9 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="size-9 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-black uppercase text-xs">
                                                            {user.full_name?.[0] || '?'}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs font-bold text-white truncate group-hover:text-brand-blue transition-colors">
                                                            {user.use_nickname && user.username ? user.username : user.full_name}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${getCategoryColor(user.user_category)}`}>
                                                                {getCategoryLabel(user.user_category)}
                                                            </span>
                                                            {user.course && (
                                                                <span className="text-[9px] text-gray-500 truncate">{user.course}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="text-brand-blue/40 group-hover:text-brand-blue transition-colors text-xs">→</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {!isSearching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                                        <p className="mt-3 text-center text-[10px] text-gray-500 font-mono italic">Nenhum usuário encontrado.</p>
                                    )}
                                </div>

                                {/* Recent Conversations */}
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
                                ) : !searchQuery && (
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

                    {/* Right Column: Mini Info / Guidelines */}
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
