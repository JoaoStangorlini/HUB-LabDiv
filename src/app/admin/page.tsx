'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Counts {
    pendentes: number;
    aprovados: number;
    rejeitados: number;
    perguntasPendentes: number;
    perguntasRespondidas: number;
    perguntasTotal: number;
    comentariosPendentes: number;
    comentariosAprovados: number;
    comentariosTotal: number;
    oportunidadesTotal: number;
    reproducoesTotal: number;
    reproducoesPendentes: number;
    reproducoesAprovadas: number;
    totalAutores: number;
    autoresFrequentes: number;
    autoresMestres: number;
}

export default function AdminDashboardOverview() {
    const [counts, setCounts] = useState<Counts>({
        pendentes: 0, aprovados: 0, rejeitados: 0,
        perguntasPendentes: 0, perguntasRespondidas: 0, perguntasTotal: 0,
        comentariosPendentes: 0, comentariosAprovados: 0, comentariosTotal: 0,
        oportunidadesTotal: 0, reproducoesTotal: 0, reproducoesPendentes: 0, reproducoesAprovadas: 0,
        totalAutores: 0,
        autoresFrequentes: 0, autoresMestres: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchCounts() {
            setIsLoading(true);

            const [
                pendentesRes, aprovadosRes, rejeitadosRes,
                pergPendentesRes, pergRespondidasRes,
                comPendentesRes, comAprovadosRes, comTotalRes,
                oportunidadesRes, reproducoesRes, repPendentesRes, repAprovadasRes, subsWithAuthorsRes
            ] = await Promise.all([
                supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
                supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'aprovado'),
                supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'rejeitado'),
                supabase.from('perguntas').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
                supabase.from('perguntas').select('*', { count: 'exact', head: true }).eq('status', 'respondida'),
                supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
                supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'aprovado'),
                supabase.from('comments').select('*', { count: 'exact', head: true }),
                supabase.from('oportunidades').select('*', { count: 'exact', head: true }),
                supabase.from('reproductions').select('*', { count: 'exact', head: true }),
                supabase.from('reproductions').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
                supabase.from('reproductions').select('*', { count: 'exact', head: true }).eq('status', 'aprovado'),
                supabase.from('submissions').select('user_id').eq('status', 'aprovado'),
            ]);

            const pPend = pergPendentesRes.count || 0;
            const pResp = pergRespondidasRes.count || 0;

            setCounts({
                pendentes: pendentesRes.count || 0,
                aprovados: aprovadosRes.count || 0,
                rejeitados: rejeitadosRes.count || 0,
                perguntasPendentes: pPend,
                perguntasRespondidas: pResp,
                perguntasTotal: pPend + pResp,
                comentariosPendentes: comPendentesRes.count || 0,
                comentariosAprovados: comAprovadosRes.count || 0,
                comentariosTotal: comTotalRes.count || 0,
                oportunidadesTotal: oportunidadesRes.count || 0,
                reproducoesTotal: reproducoesRes.count || 0,
                reproducoesPendentes: repPendentesRes.count || 0,
                reproducoesAprovadas: repAprovadasRes.count || 0,
                totalAutores: 0, // Calculated below
                autoresFrequentes: 0,
                autoresMestres: 0,
            });

            // Calculate author metrics from raw data
            const approvedSubs = (subsWithAuthorsRes.data as { user_id: string }[]) || [];
            if (approvedSubs.length > 0) {
                const authorCounts: Record<string, number> = {};
                approvedSubs.forEach(s => {
                    if (s.user_id) authorCounts[s.user_id] = (authorCounts[s.user_id] || 0) + 1;
                });

                const uniqueAuthors = Object.keys(authorCounts).length;
                const frequentes = Object.values(authorCounts).filter(c => c >= 3).length;
                const mestres = Object.values(authorCounts).filter(c => c >= 10).length;

                setCounts(prev => ({
                    ...prev,
                    totalAutores: uniqueAuthors,
                    autoresFrequentes: frequentes,
                    autoresMestres: mestres
                }));
            }

            setIsLoading(false);
        }

        fetchCounts();
    }, []);

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">

            {/* Header Section */}
            <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <span className="material-symbols-outlined text-[18px]">dashboard</span>
                    <span>Dashboard</span>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                    <span className="text-brand-blue">Visão Geral</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Visão Geral</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Acompanhe as estatísticas gerais de submissões do Hub Lab-Div.</p>
                    </div>
                    {/* Decorative Elements */}
                    <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-card-dark px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse delay-75"></div>
                        <div className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse delay-150"></div>
                        <span className="text-xs font-semibold text-gray-400 ml-2 uppercase tracking-wider">Status: Online</span>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <span className="material-symbols-outlined text-4xl animate-spin text-brand-blue mb-4">progress_activity</span>
                    <p className="font-medium animate-pulse">Carregando estatísticas do Supabase...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Pendentes Card */}
                        <Link href="/admin/pendentes" className="relative group bg-white dark:bg-card-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-brand-yellow/30 transition-all overflow-hidden cursor-pointer">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 dark:hidden rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-yellow/10 transition-colors"></div>
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aguardando Avaliação</span>
                                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-brand-yellow/10 text-brand-yellow">
                                        <span className="material-symbols-outlined text-2xl">pending_actions</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-display font-black text-gray-900 dark:text-white tracking-tight">{counts.pendentes}</span>
                                    </div>
                                    <span className="text-sm font-medium text-brand-yellow mt-1 block">Submissões Pendentes</span>
                                </div>
                            </div>
                        </Link>

                        {/* Aprovados Card */}
                        <div className="relative group bg-white dark:bg-card-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-brand-blue/30 transition-all overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 dark:hidden rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-blue/10 transition-colors"></div>
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Públicos</span>
                                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
                                        <span className="material-symbols-outlined text-2xl">verified</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-display font-black text-gray-900 dark:text-white tracking-tight">{counts.aprovados}</span>
                                    </div>
                                    <span className="text-sm font-medium text-brand-blue mt-1 block">Submissões Aprovadas</span>
                                </div>
                            </div>
                        </div>

                        {/* Rejeitados Card */}
                        <div className="relative group bg-white dark:bg-card-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-brand-red/30 transition-all overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 dark:hidden rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-red/10 transition-colors"></div>
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Arquivados</span>
                                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red">
                                        <span className="material-symbols-outlined text-2xl">block</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-display font-black text-gray-900 dark:text-white tracking-tight">{counts.rejeitados}</span>
                                    </div>
                                    <span className="text-sm font-medium text-brand-red mt-1 block">Submissões Rejeitadas</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Action: Narração */}
                        <Link href="/admin/narracao" className="relative group bg-white dark:bg-card-dark rounded-3xl p-6 border border-brand-yellow/20 dark:border-brand-yellow/10 shadow-lg hover:shadow-xl hover:border-brand-yellow/40 transition-all overflow-hidden cursor-pointer ring-1 ring-brand-yellow/5">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 dark:hidden rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-yellow/10 transition-colors"></div>
                            <div className="relative z-10 flex flex-col gap-4 h-full justify-between">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-brand-yellow uppercase tracking-[0.2em]">Acessibilidade</span>
                                    <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-brand-yellow text-white shadow-lg shadow-brand-yellow/30 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-2xl">record_voice_over</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Narração & TTS</h3>
                                    <p className="text-xs text-gray-500 font-medium">Gerenciar Acessibilidade</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* ─── Nível Principal de Gerenciamento ─── */}
                    <Link
                        href="/admin/acervo"
                        className="flex items-center gap-6 p-6 bg-white dark:bg-card-dark rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-brand-blue/40 transition-all group cursor-pointer"
                    >
                        <div className="w-20 h-20 flex items-center justify-center rounded-[24px] bg-brand-blue/10 text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all shadow-inner">
                            <span className="material-symbols-outlined text-4xl">collections_bookmark</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-brand-blue transition-colors tracking-tight">Gerenciador de Acervo Mestre</h3>
                            <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Painel central para edição rápida, filtros por autor e curadoria avançada de todas as submissões públicas e pendentes.</p>
                        </div>
                        <span className="material-symbols-outlined text-4xl text-gray-200 group-hover:text-brand-blue group-hover:translate-x-2 transition-all">chevron_right</span>
                    </Link>

                    {/* Perguntas Section */}
                    <div className="pt-4">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <span className="material-symbols-outlined text-brand-blue text-2xl">forum</span>
                            Pergunte a um Cientista
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Aguardando Resposta - VERMELHO */}
                            <Link href="/admin/perguntas" className="relative group bg-white dark:bg-card-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-brand-red/30 transition-all overflow-hidden cursor-pointer">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 dark:hidden rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-red/10 transition-colors"></div>
                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aguardando Resposta</span>
                                        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${counts.perguntasPendentes > 0 ? 'bg-brand-red/20 text-brand-red animate-pulse' : 'bg-brand-red/10 text-brand-red'}`}>
                                            <span className="material-symbols-outlined text-2xl">mark_chat_unread</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-5xl font-display font-black text-gray-900 dark:text-white tracking-tight">{counts.perguntasPendentes}</span>
                                        <span className="text-sm font-medium text-brand-red mt-1 block">
                                            {counts.perguntasPendentes > 0 ? '⚡ Perguntas para responder!' : 'Nenhuma pendente'}
                                        </span>
                                    </div>
                                </div>
                            </Link>

                            {/* Respondidas - AZUL */}
                            <div className="relative group bg-white dark:bg-card-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-brand-blue/30 transition-all overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 dark:hidden rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-blue/10 transition-colors"></div>
                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Respondidas</span>
                                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
                                            <span className="material-symbols-outlined text-2xl">check_circle</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-5xl font-display font-black text-gray-900 dark:text-white tracking-tight">{counts.perguntasRespondidas}</span>
                                        <span className="text-sm font-medium text-brand-blue mt-1 block">Perguntas Respondidas</span>
                                    </div>
                                </div>
                            </div>

                            {/* Total - AMARELO */}
                            <div className="relative group bg-white dark:bg-card-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-brand-yellow/30 transition-all overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 dark:hidden rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-yellow/10 transition-colors"></div>
                                <div className="relative z-10 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Histórico</span>
                                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-brand-yellow/10 text-brand-yellow">
                                            <span className="material-symbols-outlined text-2xl">quiz</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-5xl font-display font-black text-gray-900 dark:text-white tracking-tight">{counts.perguntasTotal}</span>
                                        <span className="text-sm font-medium text-brand-yellow mt-1 block">Interações Totais</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Engajamento Section */}
                    <div className="pt-4">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <span className="material-symbols-outlined text-brand-red text-2xl">diversity_3</span>
                            Engajamento da Comunidade
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white dark:bg-card-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Total Autores</span>
                                <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">{counts.totalAutores}</div>
                                <div className="text-[10px] font-bold text-brand-blue mt-1">PESQUISADORES ATIVOS</div>
                            </div>
                            <div className="bg-white dark:bg-card-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Frequentes (3+)</span>
                                <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">{counts.autoresFrequentes}</div>
                                <div className="text-[10px] font-bold text-brand-yellow mt-1">RUMO À MAESTRIA</div>
                            </div>
                            <div className="bg-white dark:bg-card-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Mestres (10+)</span>
                                <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">{counts.autoresMestres}</div>
                                <div className="text-[10px] font-bold text-brand-red mt-1">LÍDERES DE DIVULGAÇÃO</div>
                            </div>
                            <div className="bg-white dark:bg-card-dark rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Oportunidades</span>
                                <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">{counts.oportunidadesTotal}</div>
                                <div className="text-[10px] font-bold text-brand-blue mt-1">MURAL ATIVO</div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
