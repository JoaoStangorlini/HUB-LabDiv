'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MediaCard, MediaCardProps } from './MediaCard';
import { SkeletonCard } from './ui/SkeletonCard';
import { fetchSubmissions } from '@/app/actions/submissions';
import { checkUserLikes } from '@/app/actions/media';
import { m, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const FeaturedCarousel = dynamic(() => import('./FeaturedCarousel').then(mod => mod.FeaturedCarousel), {
    loading: () => <div className="h-64 sm:h-[400px] w-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-[40px]" />
});

import {
    Sparkles,
    ChevronLeft,
    ChevronRight,
    SearchX,
    ChevronDown,
    Zap,
    Image as ImageIcon,
    Video,
    FileText,
    BarChart,
    FolderArchive,
    Edit3,
    Plus,
    Minus,
    Flame,
    Satellite
} from 'lucide-react';

import { useSearch } from '@/providers/SearchProvider';

interface HomeClientViewProps {
    initialItems: MediaCardProps[];
    initialHasMore: boolean;
    initialCategory?: string;
    trendingItems?: MediaCardProps[];
    featuredItems?: MediaCardProps[];
    trendingTags?: string[];
    initialLikedIds?: string[];
}

export const HomeClientView = ({
    initialItems,
    initialHasMore,
    initialCategory = 'Todos',
    trendingItems = [],
    featuredItems = [],
    trendingTags = [],
    initialLikedIds = []
}: HomeClientViewProps) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { query: searchQuery, setQuery: setSearchQuery } = useSearch();

    const [items, setItems] = useState<MediaCardProps[]>(initialItems);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set(initialLikedIds));

    const [selectedCategories, setSelectedCategories] = useState<string[]>([initialCategory]);
    const [selectedMediaTypes, setSelectedMediaTypes] = useState<string[]>([]);
    const [selectedYears, setSelectedYears] = useState<string[]>(['Todos']);
    const [activePageIndex, setActivePageIndex] = useState(0);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [showAllYears, setShowAllYears] = useState(false);

    // Trending Scroll State
    const trendingScrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        if (trendingScrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = trendingScrollRef.current;
            setCanScrollLeft(scrollLeft > 10);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

            // Calculate active page index (0, 1, or 2)
            const page = Math.round((scrollLeft / (scrollWidth - clientWidth)) * 2);
            setActivePageIndex(page);
        }
    };

    useEffect(() => {
        const carousel = trendingScrollRef.current;
        if (carousel) {
            carousel.addEventListener('scroll', checkScroll);
            checkScroll();
        }
        window.addEventListener('resize', checkScroll);
        return () => {
            if (carousel) carousel.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [trendingItems]);

    // Fetch user liked IDs whenever items change
    useEffect(() => {
        const ids = [
            ...items.map(i => i.post.id),
            ...trendingItems.map(i => i.post.id),
            ...featuredItems.map(i => i.post.id)
        ];
        const unique = [...new Set(ids)];
        if (unique.length > 0) {
            checkUserLikes(unique).then(liked => setLikedIds(new Set(liked)));
        }
    }, [items, trendingItems, featuredItems]);

    const scrollTrending = (direction: 'left' | 'right') => {
        if (trendingScrollRef.current) {
            const scrollAmount = window.innerWidth > 768 ? 600 : 300;
            trendingScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const categories = ['Todos', 'Lab-Div', 'Equipamentos', 'Laboratórios', 'Física Experimental', 'Teoria', 'Pesquisadores', 'Uso Didático', 'Bastidores da Ciência', 'Gambiarras Técnicas', 'Impacto e Conquistas', 'Nossa História', 'Central de Anotações', 'Eventos', 'Física Fora da Caixa', 'Convivência', 'Mural do Deu Ruim', 'Guia de Sobrevivência', 'Outros'];
    const currentYear = 2026; // Fixed for Hub 3.1.5 context
    const years = ['Todos', ...Array.from({ length: currentYear - 1934 + 1 }, (_, i) => (currentYear - i).toString())];

    const mediaTypeOptions = [
        { label: 'Imagens', value: 'image', icon: ImageIcon, color: 'brand-blue' },
        { label: 'Vídeos', value: 'video', icon: Video, color: 'brand-red' },
        { label: 'Artigos', value: 'pdf', icon: FileText, color: 'brand-yellow' },
        { label: 'Relatórios', value: 'pdf', icon: BarChart, color: 'brand-blue' },
        { label: 'ZIPs', value: 'zip', icon: FolderArchive, color: 'brand-red' },
        { label: 'Notas', value: 'sdocx', icon: Edit3, color: 'brand-yellow' },
    ];

    // Sync filters with data fetching
    const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchFiltered = async () => {
            setIsLoading(true);
            try {
                const res = await fetchSubmissions({
                    page: 1,
                    limit: 12,
                    query: debouncedQuery,
                    categories: selectedCategories.filter(c => c !== 'Todos'),
                    mediaTypes: selectedMediaTypes,
                    years: selectedYears.includes('Todos') ? undefined : selectedYears.map(y => parseInt(y)),
                    sort: 'recentes'
                });
                setItems(res.items);
                setHasMore(res.hasMore);
                setPage(1);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        // Don't run on mount if we already have initialItems and no custom filters
        if (debouncedQuery === '' && selectedCategories.length === 1 && selectedCategories[0] === 'Todos' && selectedMediaTypes.length === 0 && selectedYears.length === 1 && selectedYears[0] === 'Todos') {
            setItems(initialItems);
            setHasMore(initialHasMore);
            return;
        }

        fetchFiltered();
    }, [debouncedQuery, selectedCategories, selectedMediaTypes, selectedYears]);

    const loadMore = async () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);
        try {
            const next = await fetchSubmissions({
                page: page + 1,
                limit: 12,
                query: debouncedQuery,
                categories: selectedCategories.filter(c => c !== 'Todos'),
                mediaTypes: selectedMediaTypes,
                years: selectedYears.includes('Todos') ? undefined : selectedYears.map(y => parseInt(y)),
                sort: 'recentes'
            });
            setItems(prev => [...prev, ...next.items]);
            setHasMore(next.hasMore);
            setPage(prev => prev + 1);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    };



    return (
        <div className="space-y-4">
            {/* HERÓI / INTRODUÇÃO */}
            <header className="relative pt-12 pb-24 flex-shrink-0 overflow-hidden rounded-[40px]">
                {/* Degradê sutil nas cores da marca */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-blue/8 rounded-full blur-[80px] -translate-x-1/3 -translate-y-1/4"></div>
                    <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] bg-brand-yellow/6 rounded-full blur-[80px] -translate-x-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-red/8 rounded-full blur-[80px] translate-x-1/3 translate-y-1/4"></div>
                </div>

                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                    <m.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-black uppercase tracking-widest mb-6"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"></span>
                        Excelência Científica
                    </m.div>

                    <m.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-display font-black text-4xl md:text-6xl tracking-tighter mb-6 text-gray-900 dark:text-white leading-[0.9] uppercase italic"
                    >
                        Hub de Comunicação Científica <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-red">Lab-Div</span>
                    </m.h1>

                    <m.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium"
                    >
                        Hub de Comunicação Científica do Lab-Div - Um projeto para melhorar a comunicação do IF-USP e reunir em um FLUXO interativo o arquivo de material de divulgação do Lab-Div e de toda a comunidade — de dentro e fora do instituto.
                    </m.p>
                </div>
            </header>

            {/* DESTAQUES (V8.0 optimized) */}
            {featuredItems.length > 0 && !debouncedQuery && selectedCategories.includes('Todos') && (
                <section className="mb-8">
                    <FeaturedCarousel items={featuredItems} />
                </section>
            )}



            {/* FILTROS (Restaurados) */}
            <section className="z-40 bg-background-light/80 dark:bg-background-dark/80 py-4 -mx-4 px-4 border-b border-gray-100 dark:border-gray-800/50 mb-8">
                <div className="flex flex-col gap-6">
                    {/* Formato */}
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 shrink-0">Formato:</span>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {mediaTypeOptions.map((option, idx) => {
                                const isActive = selectedMediaTypes.includes(option.value);
                                const Icon = option.icon;
                                const activeColor = option.color;
                                return (
                                    <button
                                        key={option.label}
                                        onClick={() => setSelectedMediaTypes(isActive ? prev => prev.filter(t => t !== option.value) : prev => [...prev, option.value])}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 shrink-0 ${isActive ? `bg-${activeColor} text-white border-${activeColor} shadow-lg ring-2 ring-${activeColor}/20` : 'bg-white dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/10 hover:border-brand-blue/30'}`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Categoria */}
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 shrink-0">Categorias:</span>
                        <div className="flex flex-wrap gap-2">
                            {(showAllCategories ? categories : categories.slice(0, 6)).map((c, idx) => {
                                const isActive = selectedCategories.includes(c);
                                const filterColors = ['brand-blue', 'brand-yellow', 'brand-red'];
                                const activeColor = filterColors[idx % filterColors.length];
                                return (
                                    <button
                                        key={c}
                                        onClick={() => {
                                            setSelectedCategories(prev => {
                                                if (c === 'Todos') return ['Todos'];
                                                const filtered = prev.filter(item => item !== 'Todos');
                                                if (isActive) {
                                                    const next = filtered.filter(item => item !== c);
                                                    return next.length === 0 ? ['Todos'] : next;
                                                }
                                                return [...filtered, c];
                                            });
                                        }}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${isActive ? `bg-${activeColor} text-white border-${activeColor} shadow-lg ring-2 ring-${activeColor}/20` : 'bg-white dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/10 hover:border-brand-blue/30'}`}
                                    >
                                        {c}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setShowAllCategories(!showAllCategories)}
                                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-brand-blue transition-all flex items-center gap-1 border-2 border-transparent"
                            >
                                {showAllCategories ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                {showAllCategories ? 'Menos' : 'Mais'}
                            </button>
                        </div>
                    </div>

                    {/* Ano */}
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 shrink-0">Ano:</span>
                        <div className="flex flex-wrap gap-2 grow">
                            {(showAllYears ? years : years.slice(0, 10)).map((y, idx) => {
                                const isActive = selectedYears.includes(y);
                                const filterColors = ['brand-blue', 'brand-yellow', 'brand-red'];
                                // Give 'Todos' a neutral primary but cycle the others
                                const activeColor = y === 'Todos' ? 'brand-blue' : filterColors[idx % filterColors.length];
                                return (
                                    <button
                                        key={y}
                                        onClick={() => {
                                            setSelectedYears(prev => {
                                                if (y === 'Todos') return ['Todos'];
                                                const filtered = prev.filter(item => item !== 'Todos');
                                                if (isActive) {
                                                    const next = filtered.filter(item => item !== y);
                                                    return next.length === 0 ? ['Todos'] : next;
                                                }
                                                return [...filtered, y];
                                            });
                                        }}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 shrink-0 ${isActive ? `bg-${activeColor} text-white border-${activeColor} shadow-lg ring-2 ring-${activeColor}/20` : 'bg-white dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/10 hover:border-brand-blue/30'}`}
                                    >
                                        {y}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setShowAllYears(!showAllYears)}
                                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-brand-blue transition-all flex items-center gap-1 border-2 border-transparent"
                            >
                                {showAllYears ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                {showAllYears ? 'Menos' : 'Mais'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* EM ÓRBITA NO IFUSP (Trending Horizontal - Mover abaixo dos filtros) */}
            {!debouncedQuery && selectedCategories.includes('Todos') && trendingItems.length > 0 && (
                <section className="w-full py-8 bg-white dark:bg-card-dark rounded-[40px] border border-gray-100 dark:border-gray-800/50 shadow-sm mb-12">
                    <div className="px-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex flex-col">
                                <h2 className="text-xl font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
                                    <Satellite className="w-5 h-5 text-brand-blue" />
                                    Em Órbita no <span className="text-brand-blue">IFUSP</span>
                                </h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Contribuições em destaque na comunidade</p>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* PONTO DE NAVEGAÇÃO COLORIDO */}
                                <div className="flex gap-2 px-3 py-1.5 rounded-full bg-white/50 dark:bg-card-dark/50 backdrop-blur-md border border-gray-100 dark:border-gray-800/50">
                                    {[0, 1, 2].map((i) => {
                                        const isActive = activePageIndex === i;
                                        const colors = ['bg-brand-yellow', 'bg-brand-blue', 'bg-brand-red'];
                                        return (
                                            <div
                                                key={i}
                                                className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${isActive ? `${colors[i]} scale-125 shadow-lg brightness-110` : 'bg-gray-300 dark:bg-gray-600 opacity-40 scale-90'}`}
                                            />
                                        );
                                    })}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => scrollTrending('left')}
                                        className="p-2 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-brand-blue hover:text-white transition-all disabled:opacity-20"
                                        disabled={!canScrollLeft}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => scrollTrending('right')}
                                        className="p-2 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-brand-blue hover:text-white transition-all disabled:opacity-20"
                                        disabled={!canScrollRight}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div
                            ref={trendingScrollRef}
                            className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth"
                        >
                            {trendingItems.map((item, index) => (
                                <m.div
                                    key={item.post.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="min-w-[280px] md:min-w-[320px] snap-start"
                                >
                                    <MediaCard post={item.post} priority={index < 2} isLikedByUser={likedIds.has(item.post.id)} />
                                </m.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* FEED PRINCIPAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 min-h-[600px]">
                {items.length > 0 ? (
                    items.map((item, index) => (
                        <m.div
                            key={item.post.id}
                            initial={index < 4 ? false : { opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.5,
                                delay: index < 4 ? 0 : (index % 6) * 0.1
                            }}
                        >
                            <MediaCard
                                post={item.post}
                                priority={index < 4}
                                isLikedByUser={likedIds.has(item.post.id)}
                            />
                        </m.div>
                    ))
                ) : !isLoading ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                        <SearchX className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-xl font-bold text-gray-400">Nenhum rastro encontrado...</p>
                        <button onClick={() => { setSearchQuery(''); setSelectedCategories(['Todos']); setSelectedMediaTypes([]); }} className="mt-4 text-brand-blue font-bold">Limpar Filtros</button>
                    </div>
                ) : null}

                {/* Skeletons for Load More */}
                {(isLoading || isLoadingMore) && (
                    <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                )}
            </div>

            {hasMore && !isLoading && !isLoadingMore && (
                <div className="flex justify-center pt-8">
                    <button
                        onClick={loadMore}
                        disabled={isLoadingMore}
                        className="group relative px-10 py-4 bg-brand-blue text-white rounded-full font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <Zap className="w-5 h-5 fill-current" />
                            Expandir Acervo
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-blue via-blue-400 to-brand-blue translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 opacity-30" />
                    </button>
                </div>
            )}
        </div>
    );
};

