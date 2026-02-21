'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { approveComment, rejectComment, deleteComment } from '@/app/actions/comments';

interface Comment {
    id: string;
    submission_id: string;
    author_name: string;
    content: string;
    status: 'pendente' | 'aprovado' | 'rejeitado';
    created_at: string;
    submissions?: {
        title: string;
    };
}

export default function AdminCommentsPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'pendente' | 'aprovado' | 'rejeitado'>('pendente');

    const fetchComments = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('comments')
            .select('*, submissions(title)')
            .eq('status', filter)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching comments:', error);
        } else {
            setComments((data as any) || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchComments();
    }, [filter]);

    const handleAction = async (action: 'approve' | 'reject' | 'delete', comment: Comment) => {
        try {
            if (action === 'approve') {
                await approveComment(comment.id, comment.submission_id);
            } else if (action === 'reject') {
                await rejectComment(comment.id, comment.submission_id);
            } else if (action === 'delete') {
                if (!confirm('Deseja excluir permanentemente este comentário?')) return;
                await deleteComment(comment.id, comment.submission_id);
            }
            fetchComments();
        } catch (error: any) {
            alert('Erro ao processar ação: ' + error.message);
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <span className="material-symbols-outlined text-[18px]">dashboard</span>
                    <span>Dashboard</span>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                    <span className="text-brand-blue">Comentários</span>
                </div>
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Moderação de Comentários</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie a interação do público com os materiais do arquivo.</p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-card-dark rounded-xl w-fit">
                {(['pendente', 'aprovado', 'rejeitado'] as const).map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${filter === s
                                ? 'bg-white dark:bg-brand-blue text-brand-blue dark:text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        {s.charAt(0).toUpperCase() + s.slice(1)}s
                    </button>
                ))}
            </div>

            {/* List */}
            {isLoading ? (
                <div className="text-center py-20 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-4xl animate-spin text-brand-blue mb-4">progress_activity</span>
                    <p className="text-gray-500 animate-pulse">Carregando comentários...</p>
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800">
                    <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">chat_bubble_outline</span>
                    <p className="text-gray-500">Nenhum comentário {filter} encontrado.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:border-brand-blue/30 transition-colors">
                            <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-xs uppercase">
                                        {comment.author_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{comment.author_name}</h3>
                                        <p className="text-[10px] text-gray-500 uppercase font-semibold">
                                            {new Date(comment.created_at).toLocaleString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-background-dark/50 p-4 rounded-xl">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{comment.content}"</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span className="material-symbols-outlined text-[16px]">link</span>
                                    <span>Em: <span className="text-brand-blue font-medium">{comment.submissions?.title || 'Submissão não encontrada'}</span></span>
                                </div>
                            </div>

                            <div className="flex md:flex-col gap-2 shrink-0 justify-center">
                                {filter === 'pendente' && (
                                    <>
                                        <button
                                            onClick={() => handleAction('approve', comment)}
                                            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">check</span> Aprovar
                                        </button>
                                        <button
                                            onClick={() => handleAction('reject', comment)}
                                            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">close</span> Negar
                                        </button>
                                    </>
                                )}
                                {filter === 'aprovado' && (
                                    <button
                                        onClick={() => handleAction('reject', comment)}
                                        className="flex-1 px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">block</span> Remover
                                    </button>
                                )}
                                {filter === 'rejeitado' && (
                                    <button
                                        onClick={() => handleAction('approve', comment)}
                                        className="flex-1 px-4 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">check_circle</span> Recuperar
                                    </button>
                                )}
                                <button
                                    onClick={() => handleAction('delete', comment)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
                                    title="Excluir permanentemente"
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
