'use client';

import { useEffect, useState } from 'react';
import { fetchAdoptions, updateAdoptionStatus } from '@/app/actions/profiles';
import { toast } from 'react-hot-toast';
import { Loader2, Check, X, User, Heart, ArrowRight, ExternalLink } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import Link from 'next/link';

export default function AdminAdoptionsPage() {
    const [adoptions, setAdoptions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        const res = await fetchAdoptions();
        if (res.success) {
            setAdoptions(res.data.filter((a: any) => a.status === 'pending'));
        } else {
            toast.error(res.error || 'Erro ao carregar adoções');
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAction = async (id: string, status: 'approved' | 'rejected') => {
        setIsProcessing(id);
        const res = await updateAdoptionStatus(id, status);
        if (res.success) {
            toast.success(status === 'approved' ? 'Adoção aprovada!' : 'Adoção rejeitada.');
            setAdoptions(prev => prev.filter(a => a.id !== id));
        } else {
            toast.error(res.error || 'Erro ao processar ação');
        }
        setIsProcessing(null);
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-3">
                        <Heart className="w-8 h-8 text-brand-red" />
                        Validação de Adoções
                    </h1>
                    <p className="text-gray-400 font-medium italic">Gerencie os vínculos entre mentores e bixos.</p>
                </div>
                <div className="bg-neutral-800/50 border border-white/5 px-4 py-2 rounded-2xl">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                        {adoptions.length} {adoptions.length === 1 ? 'Solicitação pendente' : 'Solicitações pendentes'}
                    </span>
                </div>
            </header>

            {adoptions.length === 0 ? (
                <div className="bg-neutral-900/50 border border-white/5 rounded-[32px] p-20 text-center animate-in fade-in duration-700">
                    <div className="w-24 h-24 mb-6 rounded-full border-2 border-white/10 flex items-center justify-center mx-auto bg-white/5">
                        <Check className="w-12 h-12 text-gray-600" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-white mb-2 uppercase">Interface Limpa</h2>
                    <p className="text-gray-500 font-medium italic max-w-xs mx-auto">
                        Não há solicitações de adoção aguardando validação no momento.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {adoptions.map((adoption) => (
                        <div key={adoption.id} className="bg-neutral-900 border border-white/5 rounded-[32px] overflow-hidden hover:border-brand-blue/30 transition-all group shadow-2xl">
                            <div className="p-8 flex flex-col lg:flex-row items-center justify-between gap-12">
                                {/* Mentor Card */}
                                <div className="flex-1 flex items-center gap-6 w-full">
                                    <Avatar src={adoption.mentor?.avatar_url} name={adoption.mentor?.full_name} size="lg" xp={adoption.mentor?.xp} level={adoption.mentor?.level} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-1">Mentor / Veterano</p>
                                        <h3 className="text-xl font-display font-bold text-white truncate">{adoption.mentor?.full_name}</h3>
                                        <button
                                            onClick={() => {
                                                if (adoption.mentor?.email) {
                                                    navigator.clipboard.writeText(adoption.mentor.email);
                                                    toast.success('E-mail copiado!');
                                                    window.location.href = `mailto:${adoption.mentor.email}`;
                                                }
                                            }}
                                            className="text-sm text-gray-400 italic truncate hover:text-white transition-colors block w-full text-left"
                                        >
                                            {adoption.mentor?.email}
                                        </button>
                                        <div className="mt-2 flex items-center gap-3">
                                            <Link href={`/lab?user=${adoption.mentor?.id}`} target="_blank" className="text-[10px] font-bold text-gray-500 hover:text-white uppercase flex items-center gap-1 transition-colors">
                                                <ExternalLink className="w-3 h-3" /> Ver Lab
                                            </Link>
                                            <Link href={`/emaranhamento?user=${adoption.mentor?.id}`} target="_blank" className="text-[10px] font-bold text-brand-blue hover:text-brand-blue/80 uppercase flex items-center gap-1 transition-colors">
                                                <span className="material-symbols-outlined text-sm">hub</span> Emaranhar
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Flow Icon */}
                                <div className="relative flex flex-col items-center justify-center shrink-0">
                                    <div className="absolute inset-0 bg-brand-red/20 blur-3xl rounded-full"></div>
                                    <ArrowRight className="w-12 h-12 text-brand-red relative animate-pulse" />
                                </div>

                                {/* Freshman Card */}
                                <div className="flex-1 flex items-center gap-6 w-full lg:text-right lg:flex-row-reverse">
                                    <Avatar src={adoption.freshman?.avatar_url} name={adoption.freshman?.full_name} size="lg" xp={adoption.freshman?.xp} level={adoption.freshman?.level} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-brand-yellow uppercase tracking-widest mb-1">Bixo / Adotado</p>
                                        <h3 className="text-xl font-display font-bold text-white truncate">{adoption.freshman?.full_name}</h3>
                                        <button
                                            onClick={() => {
                                                if (adoption.freshman?.email) {
                                                    navigator.clipboard.writeText(adoption.freshman.email);
                                                    toast.success('E-mail copiado!');
                                                    window.location.href = `mailto:${adoption.freshman.email}`;
                                                }
                                            }}
                                            className="text-sm text-gray-400 italic truncate hover:text-white transition-colors block w-full lg:text-right"
                                        >
                                            {adoption.freshman?.email}
                                        </button>
                                        <div className="mt-2 flex items-center lg:justify-end gap-3">
                                            <Link href={`/emaranhamento?user=${adoption.freshman?.id}`} target="_blank" className="text-[10px] font-bold text-brand-yellow hover:text-brand-yellow/80 uppercase flex items-center gap-1 transition-colors">
                                                <span className="material-symbols-outlined text-sm">hub</span> Emaranhar
                                            </Link>
                                            <Link href={`/lab?user=${adoption.freshman?.id}`} target="_blank" className="text-[10px] font-bold text-gray-500 hover:text-white uppercase flex items-center gap-1 transition-colors">
                                                <ExternalLink className="w-3 h-3" /> Ver Lab
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-4 border-t lg:border-t-0 lg:border-l border-white/5 pt-8 lg:pt-0 lg:pl-12 w-full lg:w-auto justify-center">
                                    <button
                                        onClick={() => handleAction(adoption.id, 'rejected')}
                                        disabled={isProcessing === adoption.id}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-red-950/30 text-gray-400 hover:text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                                    >
                                        <X className="w-4 h-4" />
                                        Rejeitar
                                    </button>
                                    <button
                                        onClick={() => handleAction(adoption.id, 'approved')}
                                        disabled={isProcessing === adoption.id}
                                        className="flex items-center justify-center gap-2 px-8 py-3 bg-brand-blue text-white hover:bg-brand-blue/90 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-blue/20 disabled:opacity-50"
                                    >
                                        <Check className="w-4 h-4" />
                                        Aprovar Adoção
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
