'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MainLayoutWrapper } from "@/components/layout/MainLayoutWrapper";
import { supabase } from "@/lib/supabase";
import { MessageSquare, Send, Atom, Clock, User, Star, Hash } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { LogsFeedbackCard } from './LogsFeedbackCard';

interface Drop {
    id: string;
    author_id: string;
    content: string;
    likes_count: number;
    created_at: string;
    status: string;
    is_featured: boolean;
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
            .on('postgres_changes', { event: '*', schema: 'public', table: 'micro_articles' }, () => {
                fetchDrops();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const fetchDrops = async () => {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        
        const { data, error } = await supabase
            .from('micro_articles')
            .select(`
                *,
                profiles:author_id (
                    name:full_name,
                    handle:username,
                    avatar:avatar_url
                )
            `)
            .gte('created_at', twentyFourHoursAgo)
            .or('status.eq.approved,is_featured.eq.true')
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('[PublicDrops] Fetch error:', error);
        }

        if (data) setDrops(data as Drop[]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return toast.error('Faça login para postar um Drop!');
        if (!content.trim()) return;
        if (content.length > 260) return toast.error('O limite é de 260 caracteres!');

        setIsSubmitting(true);
        const { error } = await supabase.from('micro_articles').insert({
            author_id: user.id,
            content: content.trim(),
            status: 'pending' // Posts wait for approval
        });

        if (error) {
            toast.error('Erro ao enviar log');
        } else {
            setContent('');
            toast.success('Log enviado para aprovação!');
            fetchDrops();
        }
        setIsSubmitting(false);
    };

    const featuredDrops = useMemo(() => drops.filter(d => d.is_featured), [drops]);
    const recentDrops = useMemo(() => drops.filter(d => !d.is_featured), [drops]);

    return (
        <MainLayoutWrapper
            rightSidebar={<LogsFeedbackCard />}
        >
            <div className="max-w-2xl mx-auto space-y-12 pb-20">
                {/* Header */}
                <div className="flex flex-col gap-3 relative">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-red/5 rounded-full blur-[60px] pointer-events-none"></div>
                    <h1 className="text-5xl font-black uppercase italic tracking-tighter text-brand-red flex items-center gap-4 relative z-10">
                        <MessageSquare className="w-12 h-12" />
                        Logs do IFUSP
                    </h1>

                    {/* Mobile Feedback Card - Pós H1 */}
                    <LogsFeedbackCard className="block lg:hidden mb-8" />

                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] border-l-2 border-brand-red pl-4">Divulgação científica em tempo real. O que está acontecendo no IFUSP agora?</p>
                </div>

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="relative glass-card p-8 rounded-[40px] border-brand-red/10 bg-gradient-to-br from-brand-red/10 via-transparent to-transparent shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Hash size={80} />
                    </div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Compartilhe uma descoberta rápida ou notícia do lab..."
                        className="w-full bg-transparent border-none focus:ring-0 text-xl resize-none min-h-[120px] placeholder:text-gray-700 dark:placeholder:text-gray-600 font-medium"
                        maxLength={260}
                    />
                    <div className="flex items-center justify-between mt-6 border-t dark:border-white/5 border-gray-100 pt-6">
                        <div className="flex items-center gap-4">
                            <span className={`text-[10px] font-black font-mono px-3 py-1 rounded-full border ${content.length > 240 ? 'text-brand-red border-brand-red/20 bg-brand-red/10' : 'text-gray-500 border-white/5 bg-white/5'}`}>
                                {content.length} <span className="opacity-40">/</span> 260
                            </span>
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest animate-pulse">#IFUSP_LOGS</span>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting || !content.trim()}
                            className="bg-brand-red hover:bg-red-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-brand-red/20 shadow-inner"
                        >
                            {isSubmitting ? 'Transmitindo...' : (
                                <>
                                    Lançar <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Featured Section */}
                {featuredDrops.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 px-2">
                             <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent flex-1"></div>
                             <div className="flex items-center gap-2 text-yellow-500 font-black uppercase italic tracking-tighter text-sm">
                                <Star className="w-4 h-4 fill-yellow-500" />
                                Logs Destacados
                             </div>
                             <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent flex-1"></div>
                        </div>
                        <div className="space-y-4">
                            {featuredDrops.map((drop) => (
                                <DropCard key={drop.id} drop={drop} isFeatured />
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4 px-2">
                         <div className="h-px bg-gradient-to-r from-transparent via-brand-red/50 to-transparent flex-1"></div>
                         <div className="flex items-center gap-2 text-brand-red font-black uppercase italic tracking-tighter text-sm">
                            <Clock className="w-4 h-4" />
                            Logs Recentes (24h)
                         </div>
                         <div className="h-px bg-gradient-to-r from-transparent via-brand-red/50 to-transparent flex-1"></div>
                    </div>
                    <div className="space-y-4">
                        {recentDrops.length === 0 ? (
                            <div className="py-20 text-center opacity-40">
                                <p className="font-mono text-xs uppercase tracking-widest">Nenhuma transmissão captada nas últimas 24h.</p>
                            </div>
                        ) : (
                            recentDrops.map((drop) => (
                                <DropCard key={drop.id} drop={drop} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </MainLayoutWrapper>
    );
}

function DropCard({ drop, isFeatured }: { drop: Drop, isFeatured?: boolean }) {
    const [imgError, setImgError] = useState(false);
    const [dicebearError, setDicebearError] = useState(false);
    const [likes, setLikes] = useState(drop.likes_count);
    const [isLiked, setIsLiked] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    
    const initials = (drop.profiles?.name || 'M')
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const avatarUrl = !imgError && drop.profiles?.avatar 
        ? drop.profiles.avatar 
        : !dicebearError 
            ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${drop.id}`
            : null;

    useEffect(() => {
        // Expiration Timer Logic (24h)
        const updateTimer = () => {
            const createdAt = new Date(drop.created_at).getTime();
            const expirationTime = createdAt + 24 * 60 * 60 * 1000;
            const now = Date.now();
            const diff = expirationTime - now;

            if (diff <= 0) {
                setTimeLeft('EXPIRADO');
                return;
            }

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${h}h ${m}m ${s}s`);
        };

        const timer = setInterval(updateTimer, 1000);
        updateTimer();

        // Check if liked (Initial check - simplified)
        const checkInitialLike = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('micro_article_likes')
                    .select('id')
                    .eq('article_id', drop.id)
                    .eq('user_id', user.id)
                    .single();
                if (data) setIsLiked(true);
            }
        };
        checkInitialLike();

        return () => clearInterval(timer);
    }, [drop.id, drop.created_at]);

    const handleLike = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Optimistic UI
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikes(prev => newIsLiked ? prev + 1 : prev - 1);

        const { data, error } = await supabase.rpc('toggle_micro_article_like', {
            p_article_id: drop.id,
            p_user_id: user?.id || null,
            p_fingerprint: user ? null : 'browser-native' // Basic fallback
        });

        if (error) {
            console.error('Like error:', error);
            // Rollback optimistic UI
            setIsLiked(!newIsLiked);
            setLikes(prev => !newIsLiked ? prev + 1 : prev - 1);
            toast.error('Erro ao processar curtida');
        } else if (data) {
            setLikes(data.count);
            setIsLiked(data.liked);
        }
    };

    return (
        <div 
            className={`glass-card p-8 rounded-[2.5rem] border-white/5 hover:border-white/10 transition-all flex gap-6 group relative overflow-hidden ${isFeatured ? 'bg-gradient-to-br from-yellow-500/5 to-transparent border-yellow-500/10' : ''}`}
        >
            {isFeatured && (
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Star size={40} className="fill-yellow-500 text-yellow-500" />
                </div>
            )}
            
            {/* Countdown Badge */}
            {!isFeatured && (
                <div className="absolute top-4 right-8 px-3 py-1 bg-black/40 border border-white/5 rounded-full z-20">
                    <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-brand-red animate-pulse" />
                        <span className="text-[9px] font-black font-mono text-gray-400 uppercase tracking-tighter">
                            Expira em: <span className="text-white">{timeLeft}</span>
                        </span>
                    </div>
                </div>
            )}

            <div className="shrink-0 relative">
                {avatarUrl ? (
                    <img 
                        src={avatarUrl} 
                        onError={() => {
                            if (!imgError) setImgError(true);
                            else setDicebearError(true);
                        }}
                        className={`w-14 h-14 rounded-[20px] object-cover ring-4 ${isFeatured ? 'ring-yellow-500/20' : 'ring-white/5'}`} 
                        alt={drop.profiles?.name || 'Avatar'}
                    />
                ) : (
                    <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center font-black text-xs ring-4 ${isFeatured ? 'bg-yellow-500/20 text-yellow-500 ring-yellow-500/20' : 'bg-brand-red/10 text-brand-red ring-white/5'}`}>
                        {initials}
                    </div>
                )}
            </div>
            <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="font-black text-gray-900 dark:text-white leading-tight flex items-center gap-2">
                            {drop.profiles?.name || 'Membro do IF'}
                            {isFeatured && <span className="bg-yellow-500/10 text-yellow-500 text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">DESTAQUE</span>}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black italic">@{drop.profiles?.handle || 'ifusp'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black font-mono bg-black/20 px-3 py-1.5 rounded-xl border border-white/5">
                        <Clock className="w-3 h-3 text-brand-red" />
                        {new Date(drop.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
                <p className={`leading-relaxed font-medium break-words ${isFeatured ? 'text-gray-900 dark:text-gray-100 text-lg leading-tight' : 'text-gray-700 dark:text-gray-300 text-sm'}`}>
                    {drop.content}
                </p>
                <div className="flex items-center gap-6 pt-2">
                    <button 
                        onClick={handleLike}
                        className={`flex items-center gap-2 transition-all group ${isLiked ? 'text-brand-red' : 'text-gray-500 hover:text-brand-red'}`}
                    >
                        <div className={`p-2 rounded-xl transition-all ${isLiked ? 'bg-brand-red/10' : 'group-hover:bg-brand-red/10'}`}>
                            <Atom className={`w-4 h-4 ${isLiked ? 'fill-brand-red animate-spin-slow' : 'group-hover:scale-110 transition-transform'}`} />
                        </div>
                        <span className="text-xs font-black font-mono">{likes}</span>
                    </button>
                    <div className="h-1 w-1 rounded-full bg-gray-700"></div>
                    <span className="text-[9px] font-mono text-gray-600 uppercase font-bold tracking-widest">{new Date(drop.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
            </div>
        </div>
    );
}
