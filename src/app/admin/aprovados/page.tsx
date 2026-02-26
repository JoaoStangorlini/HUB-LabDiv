'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MediaCard } from '@/components/MediaCard';
import { AdminSubmissionLightbox } from '@/components/AdminSubmissionLightbox';
import { AdminPostDTO, mapToAdminPostDTO } from '@/dtos/media';
import { CheckCircle, Inbox, Star, Ban, Loader2 } from 'lucide-react';
import { updateSubmissionAdmin, fetchAdminSubmissions } from '@/app/actions/submissions';
import toast from 'react-hot-toast';

export default function AprovadosPage() {
    const [submissions, setSubmissions] = useState<AdminPostDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<AdminPostDTO | null>(null);
    const [modalImageIdx, setModalImageIdx] = useState(0);

    const loadData = async () => {
        setIsLoading(true);
        const data = await fetchAdminSubmissions('aprovado');
        setSubmissions(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleReject = async (id: string) => {
        if (!confirm('Deseja mover esta submissão para as Negadas?')) return;
        const { error } = await updateSubmissionAdmin(id, { status: 'rejeitado' });
        if (error) {
            toast.error('Erro ao rejeitar');
        } else {
            setSubmissions(prev => prev.filter(s => s.id !== id));
            toast.success('Movido para rejeitados');
        }
    };

    const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
        const { error, data } = await updateSubmissionAdmin(id, { is_featured: !currentFeatured });
        if (error) {
            toast.error('Erro ao alterar destaque');
        } else if (data) {
            const updated = mapToAdminPostDTO(data);
            setSubmissions(prev => prev.map(s => s.id === id ? updated : s));
            if (selectedItem?.id === id) setSelectedItem(updated);
            toast.success(updated.isFeatured ? 'Destaque ativado' : 'Destaque removido');
        }
    };

    const currentIdx = selectedItem ? submissions.findIndex(i => i.id === selectedItem.id) : -1;
    const hasPrev = currentIdx > 0;
    const hasNext = currentIdx !== -1 && currentIdx < submissions.length - 1;

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasPrev) {
            setSelectedItem(submissions[currentIdx - 1]);
            setModalImageIdx(0);
        }
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasNext) {
            setSelectedItem(submissions[currentIdx + 1]);
            setModalImageIdx(0);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Dashboard</span>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="text-slate-900 dark:text-white font-medium">Aprovados</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Submissões Aprovadas</h1>
                    <p className="text-slate-500 dark:text-slate-400">Itens que estão atualmente visíveis para o público.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-semibold border border-brand-blue/20 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {submissions.length} Públicos
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-blue mb-4" />
                        <p className="font-bold uppercase tracking-widest text-xs">Sincronizando Acervo...</p>
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800">
                        <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <h3 className="text-lg font-medium text-slate-500 dark:text-slate-400">Nenhum item aprovado.</h3>
                    </div>
                ) : (
                    <div className="masonry-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {submissions.map((item) => (
                            <div key={item.id} className="flex flex-col gap-3">
                                <div onClick={() => { setSelectedItem(item); setModalImageIdx(0); }} className="cursor-pointer">
                                    <MediaCard post={item} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleFeatured(item.id, item.isFeatured)}
                                        className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${item.isFeatured
                                            ? 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/30 hover:bg-brand-yellow/20'
                                            : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 hover:text-brand-yellow hover:border-brand-yellow/30'
                                            }`}
                                    >
                                        <Star className={`w-4 h-4 ${item.isFeatured ? 'fill-current' : ''}`} />
                                        <span>{item.isFeatured ? 'Destaque' : 'Destacar'}</span>
                                    </button>
                                    <button
                                        onClick={() => handleReject(item.id)}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 transition-colors text-sm font-medium"
                                    >
                                        <Ban className="w-4 h-4" />
                                        <span>Rejeitar</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedItem && (
                <AdminSubmissionLightbox
                    item={selectedItem}
                    statusType="aprovado"
                    onClose={() => setSelectedItem(null)}
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    onReject={handleReject}
                    onToggleFeatured={handleToggleFeatured}
                    modalImageIdx={modalImageIdx}
                    setModalImageIdx={setModalImageIdx}
                />
            )}
        </div>
    );
}
