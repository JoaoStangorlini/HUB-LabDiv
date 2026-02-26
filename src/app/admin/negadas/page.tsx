'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MediaCard } from '@/components/MediaCard';
import { AdminSubmissionLightbox } from '@/components/AdminSubmissionLightbox';
import { PostDTO, AdminPostDTO, mapToAdminPostDTO } from '@/dtos/media';
import { toast } from 'react-hot-toast';
import {
    LayoutDashboard, Archive, Inbox, RefreshCw,
    ArrowLeft, Clock
} from 'lucide-react';

// Use AdminPostDTO from dtos/media

export default function NegadasPage() {
    const [submissions, setSubmissions] = useState<AdminPostDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<AdminPostDTO | null>(null);
    const [modalImageIdx, setModalImageIdx] = useState(0);

    const fetchNegadas = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .eq('status', 'rejeitado')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching submissions', error);
            toast.error('Erro ao carregar negadas');
        } else {
            setSubmissions((data || []).map(s => mapToAdminPostDTO(s)));
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchNegadas();
    }, []);

    const handleApprove = async (id: string, feedback?: string) => {
        if (!confirm('Deseja restaurar esta submissão e marcá-la como Aprovada?')) return;

        const { error } = await supabase
            .from('submissions')
            .update({
                status: 'aprovado',
                admin_feedback: feedback
            })
            .eq('id', id);

        if (error) {
            toast.error('Erro ao restaurar submissão');
        } else {
            setSubmissions(prev => prev.filter(s => s.id !== id));
            toast.success('Submissão restaurada');
        }
    };

    const currentSubmissionIndex = selectedItem ? submissions.findIndex(i => i.id === selectedItem.id) : -1;
    const hasPrevSubmission = currentSubmissionIndex > 0;
    const hasNextSubmission = currentSubmissionIndex !== -1 && currentSubmissionIndex < submissions.length - 1;

    const handlePrevSubmission = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasPrevSubmission) {
            setSelectedItem(submissions[currentSubmissionIndex - 1]);
            setModalImageIdx(0);
        }
    };

    const handleNextSubmission = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasNextSubmission) {
            setSelectedItem(submissions[currentSubmissionIndex + 1]);
            setModalImageIdx(0);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
    };

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-sm">
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                <span className="text-slate-500 hover:text-primary transition-colors cursor-pointer">Dashboard</span>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="text-slate-900 dark:text-white font-medium">Negadas</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Submissões Negadas</h1>
                    <p className="text-slate-500 dark:text-slate-400">Itens que foram rejeitados e não estão visíveis para o público.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold border border-red-200">
                        {submissions.length} Rejeitados
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {isLoading ? (
                    <div className="text-center py-10 text-slate-500 flex flex-col items-center gap-3">
                        <RefreshCw className="w-8 h-8 animate-spin text-brand-blue" />
                        Carregando itens...
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700">
                        <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <h3 className="text-lg font-medium text-slate-500 dark:text-slate-400">Nenhum item rejeitado.</h3>
                    </div>
                ) : (
                    <div className="masonry-grid opacity-70 hover:opacity-100 transition-opacity">
                        {submissions.map((item) => {
                            return (
                                <div key={item.id} className="flex flex-col gap-3 grayscale hover:grayscale-0 transition-all">
                                    <div onClick={() => { setSelectedItem(item); setModalImageIdx(0); }}>
                                        <MediaCard post={item} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleApprove(item.id)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 border border-brand-blue/20 transition-colors text-sm font-medium"
                                            title="Desfazer e Aprovar"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            <span>Restaurar (Aprovar)</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(item.createdAt)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Global Admin Modal */}
            {selectedItem && (
                <AdminSubmissionLightbox
                    item={selectedItem}
                    statusType="rejeitado"
                    onClose={() => setSelectedItem(null)}
                    hasPrev={hasPrevSubmission}
                    hasNext={hasNextSubmission}
                    onPrev={handlePrevSubmission}
                    onNext={handleNextSubmission}
                    onApprove={handleApprove}
                    modalImageIdx={modalImageIdx}
                    setModalImageIdx={setModalImageIdx}
                />
            )}
        </div>
    );
}
