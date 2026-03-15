'use client';

import React, { useState, useEffect } from 'react';
import { MainLayoutWrapper } from "@/components/layout/MainLayoutWrapper";
import { supabase } from "@/lib/supabase";
import { MessageSquare, Send, Heart, Clock, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Drop {
    id: string;
    author_id: string;
    content: string;
    likes_count: number;
    created_at: string;
    profiles?: {
        name: string;
        avatar: string;
        handle: string;
    };
}

export default function DropsPage() {
    const [drops, setDrops] = useState<Drop[]>([]);
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        fetchDrops();
        supabase.auth.getUser().then(({ data }) => setUser(data.user));

        const channel = supabase
            .channel('drops_realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'micro_articles' }, (payload) => {
                setDrops(current => [payload.new as Drop, ...current]);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const fetchDrops = async () => {
        const { data, error } = await supabase
            .from('micro_articles')
            .select('*, profiles(name, avatar, handle)')
            .order('created_at', { ascending: false });
        
        if (data) setDrops(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return toast.error('Faça login para postar um Drop!');
        if (!content.trim()) return;
        if (content.length > 260) return toast.error('O limite é de 260 caracteres!');

        setIsSubmitting(true);
        const { error } = await supabase.from('micro_articles').insert({
            author_id: user.id,
            content: content.trim()
        });

        if (error) {
            toast.error('Erro ao enviar Drop');
        } else {
            setContent('');
            toast.success('Radar Científico atualizado!');
            fetchDrops();
        }
        setIsSubmitting(false);
    };

    return (
        <MainLayoutWrapper>
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter text-brand-red flex items-center gap-3">
                        <MessageSquare className="w-10 h-10" />
                        Drops / <span className="text-gray-400">Radar Científico</span>
                    </h1>
                    <p className="text-gray-500 font-medium">Divulgação científica em tempo real. O que está acontecendo no IFUSP agora?</p>
                </div>

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="glass-card p-6 rounded-[32px] border-brand-red/10 bg-gradient-to-br from-brand-red/5 to-transparent">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Compartilhe uma descoberta rápida ou notícia do lab..."
                        className="w-full bg-transparent border-none focus:ring-0 text-lg resize-none min-h-[100px] placeholder:text-gray-600"
                        maxLength={260}
                    />
                    <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
                        <span className={`text-xs font-bold ${content.length > 240 ? 'text-brand-red' : 'text-gray-500'}`}>
                            {content.length}/260
                        </span>
                        <button
                            type="submit"
                            disabled={isSubmitting || !content.trim()}
                            className="bg-brand-red text-white px-6 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? 'Enviando...' : (
                                <>
                                    Lançar <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* List Area */}
                <div className="space-y-4">
                    {drops.map((drop) => (
                        <div key={drop.id} className="glass-card p-6 rounded-3xl border-white/5 hover:border-white/10 transition-all flex gap-4">
                            <div className="shrink-0">
                                {drop.profiles?.avatar ? (
                                    <img src={drop.profiles.avatar} className="w-12 h-12 rounded-2xl object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                                        <User className="w-6 h-6 text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900 dark:text-white leading-tight">{drop.profiles?.name || 'Membro do IF'}</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">@{drop.profiles?.handle || 'ifusp'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold">
                                        <Clock className="w-3 h-3" />
                                        {new Date(drop.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                    {drop.content}
                                </p>
                                <div className="flex items-center gap-4 pt-2">
                                    <button className="flex items-center gap-1.5 text-gray-500 hover:text-brand-red transition-colors group">
                                        <Heart className="w-4 h-4 group-hover:fill-brand-red" />
                                        <span className="text-xs font-bold">{drop.likes_count}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </MainLayoutWrapper>
    );
}
