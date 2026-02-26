'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MediaCard, MediaCardProps } from './MediaCard';
import { fetchSubmissions } from '@/app/actions/submissions';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const FeaturedCarousel = dynamic(() => import('./FeaturedCarousel').then(m => ({ default: m.FeaturedCarousel })), {
    ssr: false,
    loading: () => <div className="h-64 sm:h-[400px] w-full bg-white/5 rounded-[40px] animate-pulse mb-8" />
});
import { useSearchAutocomplete } from '@/hooks/useSearchAutocomplete';
import { highlightMatch } from '@/lib/utils';
import { useSearch } from '@/providers/SearchProvider';

interface HomeClientViewProps {
    initialItems: MediaCardProps[];
    initialHasMore: boolean;
    initialCategory?: string;
    trendingItems?: MediaCardProps[];
    featuredItems?: MediaCardProps[];
    trendingTags?: string[];
}


export const HomeClientView = ({
    initialItems,
    initialHasMore,
    initialCategory = 'Todos',
    trendingItems = [],
    featuredItems = [],
    trendingTags = []
}: HomeClientViewProps) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const authorFilter = searchParams.get('autor');
    const collectionFilter = searchParams.get('collection');
    const typeFilter = searchParams.get('type');

    // Search & Filter State
    const { query: searchQuery, setQuery: setSearchQuery, placeholder } = useSearch();
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([initialCategory]);
    const [selectedMediaTypes, setSelectedMediaTypes] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
    const [sortOrder, setSortOrder] = useState<'recentes' | 'antigas'>('recentes');

    const [showAllCategories, setShowAllCategories] = useState(false);

    const { suggestions, isLoading: isAutocompleteLoading } = useSearchAutocomplete(searchQuery);

    // Pagination & Data State
    const [items, setItems] = useState<MediaCardProps[]>(initialItems);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);


    // No need for mousePos React state anymore! Using CSS Variables for performance.
    const headerRef = useRef<HTMLElement>(null);
    const filtersScrollRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const trendingScrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Update scroll buttons for trending carousel
    const updateTrendingScroll = () => {
        if (trendingScrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = trendingScrollRef.current;
            setCanScrollLeft(scrollLeft > 10);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        const carousel = trendingScrollRef.current;
        if (carousel) {
            carousel.addEventListener('scroll', updateTrendingScroll);
            updateTrendingScroll();
        }
        window.addEventListener('resize', updateTrendingScroll);
        return () => {
            if (carousel) carousel.removeEventListener('scroll', updateTrendingScroll);
            window.removeEventListener('resize', updateTrendingScroll);
        };
    }, [trendingItems]);

    // Epic Feature #12: Keyboard Navigation for Carousels
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isSearchFocused) return;
            if (e.key === 'ArrowRight') scrollTrending('right');
            if (e.key === 'ArrowLeft') scrollTrending('left');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSearchFocused]);

    const scrollTrending = (direction: 'left' | 'right') => {
        if (trendingScrollRef.current) {
            const scrollAmount = window.innerWidth > 768 ? 600 : 300;
            trendingScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchContainerRef]);

    const scrollFilters = (direction: 'left' | 'right') => {
        if (filtersScrollRef.current) {
            const scrollAmount = 300;
            filtersScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    const categories = ['Todos', 'Destaques', 'Equipamentos', 'Laboratórios', 'Física Experimental', 'Teoria', 'Pesquisadores', 'Uso Didático', 'Bastidores da Ciência', 'Gambiarras Técnicas', 'Impacto e Conquistas', 'Central de Anotações', 'Outros'];
    const mediaTypeOptions = [
        { label: 'Imagens', value: 'image', icon: 'image' },
        { label: 'Vídeos', value: 'video', icon: 'videocam' },
        { label: 'Artigos', value: 'pdf', icon: 'description' },
        { label: 'Relatórios', value: 'analytics', icon: 'analytics' },
        { label: 'ZIPs', value: 'zip', icon: 'folder_zip' },
        { label: 'Notas', value: 'sdocx', icon: 'edit_note' },
    ];
    const infraOptions = [
        { label: 'Equipamentos', value: 'Equipamentos', icon: 'precision_manufacturing' },
        { label: 'Laboratórios', value: 'Laboratórios', icon: 'science' },
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 40 }, (_, i) => currentYear - i);

    // Debounce Search 
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleTrendingTagClick = (tag: string) => {
        setSearchQuery(`#${tag}`);
        setIsSearchFocused(false);
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Fetch new results when filters change
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const fetchFiltered = async () => {
            setIsLoading(true);
            try {
                const res = await fetchSubmissions({
                    page: 1,
                    limit: 12,
                    query: debouncedQuery,
                    categories: selectedCategories.filter(c => c !== 'Todos' && c !== 'Destaques'),
                    is_featured: selectedCategories.includes('Destaques') ? true : undefined,
                    mediaTypes: selectedMediaTypes,
                    sort: sortOrder,
                    author: authorFilter || collectionFilter || undefined,
                    year: selectedYear
                });
                setItems(res.items);
                setHasMore(res.hasMore);
                setPage(1);
            } catch (err) {
                console.error("Failed to fetch", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFiltered();
    }, [debouncedQuery, selectedCategories, selectedMediaTypes, sortOrder, authorFilter, collectionFilter, selectedYear]);

    const handleLoadMore = async () => {
        if (!hasMore || isLoadingMore) return;
        setIsLoadingMore(true);
        const nextPage = page + 1;
        try {
            const res = await fetchSubmissions({
                page: nextPage,
                limit: 12,
                query: debouncedQuery,
                categories: selectedCategories.filter(c => c !== 'Todos' && c !== 'Destaques'),
                is_featured: selectedCategories.includes('Destaques') ? true : undefined,
                mediaTypes: selectedMediaTypes,
                sort: sortOrder,
                author: authorFilter || collectionFilter || undefined,
                year: selectedYear
            });
            setItems(prev => [...prev, ...res.items]);
            setHasMore(res.hasMore);
            setPage(nextPage);
        } catch (err) {
            console.error("Failed to load more", err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    // Removal of modal navigation logic

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        if (!headerRef.current) return;
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        headerRef.current.style.setProperty('--mouse-x', x.toString());
        headerRef.current.style.setProperty('--mouse-y', y.toString());
    };

    const handleMouseLeave = () => {
        if (!headerRef.current) return;
        headerRef.current.style.setProperty('--mouse-x', '0');
        headerRef.current.style.setProperty('--mouse-y', '0');
    };

    return (
        <>
            <header
                ref={headerRef}
                className="relative pt-20 pb-32 overflow-hidden flex-shrink-0"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <div className="absolute inset-0 bg-background-light dark:bg-background-dark -z-20"></div>
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:30px_30px] opacity-10 dark:opacity-30 -z-10"></div>

                {/* IDV Blobs */}
                <div
                    className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-blue/50 dark:bg-blue-500/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 animate-blob-bounce transition-transform duration-700 ease-out z-0"
                    style={{ transform: `translate(calc(-10% + var(--mouse-x, 0) * -120px), calc(-20% + var(--mouse-y, 0) * -120px))` }}
                ></div>
                <div
                    className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-brand-red/50 dark:bg-red-500/40 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 animate-blob-bounce transition-transform duration-700 ease-out delay-75"
                    style={{ transform: `translate(calc(-25% + var(--mouse-x, 0) * 100px), calc(33.333% + var(--mouse-y, 0) * 100px))` }}
                ></div>
                <div
                    className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-brand-yellow/50 dark:bg-yellow-400/40 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-blob-bounce transition-transform duration-700 ease-out delay-150"
                    style={{ transform: `translate(calc(-50% + var(--mouse-x, 0) * -160px), calc(-50% + var(--mouse-y, 0) * -160px))` }}
                ></div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 border border-brand-blue/20 dark:border-brand-blue/30 text-brand-blue dark:text-blue-400 text-xs font-semibold uppercase tracking-wide mb-6">
                            <span className="w-2 h-2 rounded-full bg-brand-blue dark:bg-blue-400 animate-pulse"></span>
                            Excelência Científica
                        </div>
                        <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-6xl tracking-tight mb-6 text-gray-900 dark:text-white leading-[1.1] uppercase italic">
                            Hub de Comunicação Científica <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-red">Lab-Div</span>
                        </h2>
                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                            Hub de Comunicação Científica do Lab-Div - Um projeto para melhorar a comunicação do IF-USP e reunir em um FLUXO interativo o arquivo de material de divulgação do Lab-Div e de toda a comunidade — de dentro e fora do instituto.
                        </p>
                    </div>
                </div>

                {/* Soft Edge Masks (Top, Bottom, Sides) */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background-light dark:from-background-dark to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background-light dark:from-background-dark to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background-light dark:from-background-dark to-transparent z-10 pointer-events-none"></div>
            </header>

            {/* ===== SEÇÃO 2: DESTAQUES (Netflix Style) ===== */}
            {!debouncedQuery && selectedCategories.includes('Todos') && featuredItems.length > 0 && (
                <section className="w-full py-8">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <FeaturedCarousel items={featuredItems} />
                    </div>
                </section>
            )}

            {/* ===== SEÇÃO 3: EM ÓRBITA NO IFUSP (Trending Horizontal) ===== */}
            {!debouncedQuery && selectedCategories.includes('Todos') && trendingItems.length > 0 && (
                <section className="w-full py-6">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-brand-blue">flare</span>
                                Isótopos em Órbita
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => scrollTrending('left')}
                                    disabled={!canScrollLeft}
                                    className="p-2 rounded-full bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-brand-blue transition-all disabled:opacity-30"
                                >
                                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">chevron_left</span>
                                </button>
                                <button
                                    onClick={() => scrollTrending('right')}
                                    disabled={!canScrollRight}
                                    className="p-2 rounded-full bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-brand-blue transition-all disabled:opacity-30"
                                >
                                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">chevron_right</span>
                                </button>
                            </div>
                        </div>
                        <div
                            ref={trendingScrollRef}
                            className="flex gap-6 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth"
                        >
                            {trendingItems.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.08 }}
                                    className="min-w-[280px] md:min-w-[340px] snap-start"
                                >
                                    <MediaCard {...item} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ===== SEÇÃO 4: FILTROS (Badges) ===== */}
            <section className="w-full z-40 bg-transparent mt-4 mb-4">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-4 py-4">
                        <div className="flex-1 overflow-hidden">
                            <AnimatePresence mode="wait">
                                {(
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="flex flex-wrap items-center gap-x-8 gap-y-4"
                                    >
                                        {/* Formato Filter - Real Text Badges */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Formato:</span>
                                            <div className="flex flex-wrap gap-2">
                                                {mediaTypeOptions.map(option => {
                                                    const isActive = selectedMediaTypes.includes(option.value);
                                                    return (
                                                        <button
                                                            key={option.value}
                                                            onClick={() => setSelectedMediaTypes(isActive ? prev => prev.filter(t => t !== option.value) : prev => [...prev, option.value])}
                                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${isActive ? 'bg-brand-blue text-white border-brand-blue shadow-lg shadow-brand-blue/20' : 'bg-gray-50/50 dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/10 hover:border-brand-blue/30'}`}
                                                        >
                                                            <span className="material-symbols-outlined text-sm">{option.icon}</span>
                                                            {option.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Categoria Filter - Chips */}
                                        <div className="flex items-center gap-4 pl-4 border-l-2 border-gray-100 dark:border-white/10">
                                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 shrink-0">Categoria:</span>
                                            <div className="flex flex-wrap gap-2">
                                                {(showAllCategories ? categories : categories.slice(0, 6)).map(c => {
                                                    const isActive = selectedCategories.includes(c);
                                                    return (
                                                        <button
                                                            key={c}
                                                            onClick={() => setSelectedCategories(isActive ? ['Todos'] : [c])}
                                                            className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border-2 ${isActive ? 'bg-brand-blue text-white border-brand-blue shadow-lg' : 'bg-gray-50/50 dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/10 hover:border-brand-blue/30'}`}
                                                        >
                                                            {c}
                                                        </button>
                                                    );
                                                })}
                                                <button
                                                    onClick={() => setShowAllCategories(!showAllCategories)}
                                                    className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-brand-blue transition-colors border-2 border-transparent hover:border-brand-blue/30 flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-sm">{showAllCategories ? 'remove' : 'add'}</span>
                                                    {showAllCategories ? 'menos' : 'mais'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== SEÇÃO 5: FLUXO PRINCIPAL (Feed Infinito) ===== */}
            <section className="bg-background-subtle dark:bg-background-dark py-12 pb-32 md:pb-16 transition-colors flex-grow">
                <div className="mx-auto max-w-2xl px-4 sm:px-6">

                    {isLoading ? (
                        <div className="flex flex-col gap-10">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-full h-[500px] bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl">
                                    <div className="h-2/3 w-full bg-gray-300 dark:bg-gray-700 rounded-t-2xl"></div>
                                    <div className="p-6 space-y-4">
                                        <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                        <div className="h-4 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {(debouncedQuery || !selectedCategories.includes('Todos') || selectedMediaTypes.length > 0) && (
                                <div className="mb-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                                    <h2 className="text-sm md:text-lg font-bold text-gray-800 dark:text-gray-200">
                                        {debouncedQuery ? `Resultados para "${debouncedQuery}"` : 'Resultados'}
                                        {!selectedCategories.includes('Todos') && <span className="text-brand-blue dark:text-brand-yellow font-extrabold ml-1">em {selectedCategories.join(', ')}</span>}
                                    </h2>
                                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{items.length} iten(s)</span>
                                </div>
                            )}

                            <div className="flex flex-col gap-6 md:gap-10">
                                {items.length > 0 ? (
                                    items.map((item, index) => (
                                        <MediaCard key={item.id} {...item} priority={index < 2} />
                                    ))
                                ) : (
                                    <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center p-8">
                                        <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3">search_off</span>
                                        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Nenhum resultado encontrado</h3>
                                        <p className="text-gray-500 mt-2">Tente ajustar seus filtros ou termo de busca.</p>
                                        <button
                                            onClick={() => { setSearchQuery(''); setSelectedCategories(['Todos']); setSelectedMediaTypes([]); }}
                                            className="mt-6 px-6 py-3 bg-brand-blue text-white font-bold rounded-2xl hover:opacity-90 transition-all active:scale-95"
                                        >
                                            Limpar Filtros
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {hasMore && !isLoading && (
                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                className={`group relative overflow-hidden inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-900 dark:bg-white px-8 py-4 text-sm font-bold text-white dark:text-gray-900 shadow-xl transition-all min-w-[200px] ${isLoadingMore ? 'opacity-75 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-2xl active:translate-y-0'}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-red opacity-0 group-hover:opacity-20 dark:group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative flex items-center gap-2">
                                    {isLoadingMore ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"></div>
                                            Carregando...
                                        </>
                                    ) : (
                                        <>
                                            Carregar mais
                                            <span className="material-symbols-outlined text-xl group-hover:translate-y-1 transition-transform">expand_more</span>
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </section >

        </>
    );
};
