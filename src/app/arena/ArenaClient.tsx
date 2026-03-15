'use client';

import React, { useState, useEffect } from 'react';
import { fetchChallenges, submitToChallenge, voteSubmission } from '@/app/actions/arena';
import { Avatar } from '@/components/ui/Avatar';
import { Loader2, Trophy, MessageSquare, ThumbsUp, Plus, Calendar, AlertCircle, Microscope, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { updateProfile } from '@/app/actions/profiles';

export default function ArenaClient({ profile }: { profile: any }) {
    const [challenges, setChallenges] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showSubmitModal, setShowSubmitModal] = useState<string | null>(null);
    const [submissionContent, setSubmissionContent] = useState('');
    const [isSeekingAssistant, setIsSeekingAssistant] = useState(profile?.seeking_assistant || false);
    const [isUpdatingRecruitment, setIsUpdatingRecruitment] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        const res = await fetchChallenges();
        if (res.success && res.data) {
            setChallenges(res.data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleToggleRecruitment = async () => {
        setIsUpdatingRecruitment(true);
        const nextValue = !isSeekingAssistant;
        const res = await updateProfile({ seeking_assistant: nextValue });

        if (res.success) {
            setIsSeekingAssistant(nextValue);
            toast.success(nextValue ? 'Recrutamento ativado!' : 'Recrutamento desativado.');
        } else {
            toast.error(res.error || 'Erro ao atualizar recrutamento');
        }
        setIsUpdatingRecruitment(false);
    };

    const handleSubmit = async (challengeId: string) => {
        if (!submissionContent.trim()) {
            toast.error('O conteúdo não pode estar vazio');
            return;
        }

        const res = await submitToChallenge(challengeId, submissionContent);
        if (res.success) {
            toast.success('Submissão enviada com sucesso!');
            setShowSubmitModal(null);
            setSubmissionContent('');
            loadData();
        } else {
            toast.error(res.error || 'Erro ao enviar submissão');
        }
    };

    const handleVote = async (submissionId: string) => {
        const res = await voteSubmission(submissionId);
        if (res.success) {
            toast.success('Voto computado!');
            loadData();
        } else {
            toast.error(res.error || 'Erro ao votar');
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                    <h1 className="text-4xl font-display font-black text-white uppercase tracking-tighter">
                        Arena de <span className="text-brand-yellow">Pesquisadores</span>
                    </h1>
                    <p className="text-gray-400 font-medium italic">Onde o conhecimento se torna um desafio coletivo.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <button
                        onClick={handleToggleRecruitment}
                        disabled={isUpdatingRecruitment}
                        className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg flex items-center gap-2 border ${isSeekingAssistant
                            ? 'bg-brand-yellow/10 border-brand-yellow text-brand-yellow'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-brand-yellow/30'
                            }`}
                    >
                        {isUpdatingRecruitment ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isSeekingAssistant ? (
                            <UserPlus className="w-4 h-4" />
                        ) : (
                            <Microscope className="w-4 h-4" />
                        )}
                        {isSeekingAssistant ? 'Recrutando Alunos' : 'Quero um ajudante'}
                    </button>

                    <button className="px-6 py-3 bg-brand-yellow text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 transition-all shadow-lg flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Propor Desafio
                    </button>
                </div>
            </header>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-brand-yellow animate-spin" />
                </div>
            ) : challenges.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-white/5 rounded-[40px] border border-white/5">
                    <div className="w-20 h-20 mb-6 rounded-full bg-brand-yellow/10 flex items-center justify-center">
                        <Trophy className="w-10 h-10 text-brand-yellow/40" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white uppercase italic">A arena está silenciosa...</h2>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2 font-medium">Seja o primeiro a propor um desafio para a comunidade de pesquisadores!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {challenges.map((challenge) => (
                        <div key={challenge.id} className="glass-card rounded-[40px] border border-white/5 overflow-hidden flex flex-col hover:border-brand-yellow/30 transition-all duration-500">
                            <div className="p-8 space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-brand-yellow/10 text-brand-yellow text-[9px] font-black uppercase rounded tracking-widest">Ativo</span>
                                            <div className="flex items-center gap-1 text-[9px] font-bold text-gray-500 uppercase">
                                                <Calendar className="w-3 h-3" />
                                                Até {format(new Date(challenge.deadline), "dd 'de' MMM", { locale: ptBR })}
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">{challenge.title}</h3>
                                    </div>
                                    <Avatar 
                                        src={challenge.creator?.avatar_url} 
                                        name={challenge.creator?.use_nickname ? challenge.creator.username : challenge.creator?.full_name} 
                                        size="md"
                                    />
                                </div>

                                <p className="text-[13px] text-gray-400 leading-relaxed indent-4">
                                    {challenge.description}
                                </p>

                                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                        <MessageSquare className="w-4 h-4" />
                                        {challenge.submissions_count || 0} Submissões
                                    </div>
                                    <button 
                                        onClick={() => setShowSubmitModal(challenge.id)}
                                        className="px-4 py-2 bg-white/5 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                    >
                                        Participar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showSubmitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-[#1E1E1E] rounded-[40px] border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tight">Sua Contribuição</h3>
                                <button onClick={() => setShowSubmitModal(null)} className="text-gray-500 hover:text-white transition-colors">&times;</button>
                            </div>

                            <textarea 
                                value={submissionContent}
                                onChange={(e) => setSubmissionContent(e.target.value)}
                                className="w-full h-48 bg-black/20 border border-white/5 rounded-3xl p-6 text-sm text-gray-300 focus:outline-none focus:border-brand-yellow/50 transition-all resize-none"
                                placeholder="Descreva seu resumo ou solução para o desafio..."
                            />

                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => handleSubmit(showSubmitModal)}
                                    className="flex-1 py-4 bg-brand-yellow text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-[1.02] transition-all shadow-lg"
                                >
                                    Enviar para Arena
                                </button>
                                <button 
                                    onClick={() => setShowSubmitModal(null)}
                                    className="px-8 py-4 bg-white/5 text-gray-400 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-brand-yellow/10 rounded-2xl border border-brand-yellow/20">
                                <AlertCircle className="w-5 h-5 text-brand-yellow shrink-0 mt-0.5" />
                                <p className="text-[10px] text-brand-yellow font-bold uppercase tracking-tight leading-normal">
                                    Importante: Após o envio, outros pesquisadores poderão visualizar e votar na sua contribuição.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
