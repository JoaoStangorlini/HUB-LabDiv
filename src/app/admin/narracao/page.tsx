'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { MediaCard, MediaCardProps } from '@/components/MediaCard';

function CarouselSection({
    title,
    items,
    onAction
}: {
    title: string;
    items: any[];
    onAction: (id: string, description: string) => void
}) {
    return (
        <section className="space-y-4">
            <h2 className="text-xl font-bold dark:text-white px-2 border-l-4 border-brand-blue">{title} ({items.length})</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
                {items.length === 0 ? (
                    <p className="text-gray-500 text-sm px-4 py-8 bg-gray-50 dark:bg-card-dark rounded-xl w-full border border-dashed border-gray-200 dark:border-gray-800">Nenhum item encontrado nesta categoria.</p>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="min-w-[300px] bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 space-y-3">
                            <MediaCard id={item.id} title={item.title} authors={item.authors} category={item.category} mediaType={item.media_type} mediaUrl={item.media_url} description={item.description} />
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase text-gray-400">Descrição para Narração</label>
                                <textarea
                                    className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-background-dark dark:text-white resize-none h-20"
                                    defaultValue={item.description}
                                    onBlur={(e) => onAction(item.id, e.target.value)}
                                    placeholder="Adicione uma descrição clara para acessibilidade..."
                                />
                                <div className="flex justify-end">
                                    <span className="text-[10px] text-brand-blue font-medium">Salva automaticamente ao sair do campo</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}

export default function AdminNarracaoPage() {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSubmissions = async () => {
        setLoading(true);
        const { data } = await supabase.from('submissions').select('*').eq('status', 'aprovado').order('created_at', { ascending: false });
        setSubmissions(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchSubmissions(); }, []);

    const pendentes = useMemo(() => submissions.filter(s => !s.description || s.description.trim().length < 10), [submissions]);
    const comNarracao = useMemo(() => submissions.filter(s => s.description && s.description.trim().length >= 10), [submissions]);

    const handleUpdateDescription = async (id: string, description: string) => {
        const { error } = await supabase.from('submissions').update({ description }).eq('id', id);
        if (error) {
            alert('Erro ao atualizar descrição: ' + error.message);
        } else {
            // Update local state without refetching for smoothness
            setSubmissions(prev => prev.map(s => s.id === id ? { ...s, description } : s));
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-10">
            <div>
                <Link href="/admin" className="text-brand-blue text-sm flex items-center gap-1 hover:underline mb-2">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span> Voltar ao Admin
                </Link>
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Painel de Narração & Acessibilidade</h1>
                <p className="text-gray-500 dark:text-gray-400">Gerencie as descrições de texto que alimentam o sintetizador de voz (TTS).</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><span className="animate-spin material-symbols-outlined text-4xl text-brand-blue">progress_activity</span></div>
            ) : (
                <>
                    <CarouselSection title="Pendentes / Curtas" items={pendentes} onAction={handleUpdateDescription} />
                    <CarouselSection title="Com Narração Completa" items={comNarracao} onAction={handleUpdateDescription} />
                </>
            )}
        </div>
    );
}
