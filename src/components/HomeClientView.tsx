'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MediaCard, MediaCardProps } from './MediaCard';
import { SkeletonCard } from './ui/SkeletonCard';
import { fetchSubmissions } from '@/app/actions/submissions';
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
    Zap
} from 'lucide-react';

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
    const { query: searchQuery } = useSearch();

    const [items, setItems] = useState<MediaCardProps[]>(initialItems);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [selectedCategories, setSelectedCategories] = useState<string[]>([initialCategory]);

    // Auto-scroll and layout refs
    const trendingScrollRef = useRef<HTMLDivElement>(null);

    // Sync items with initialItems when filters change (simplified for brevity)
    useEffect(() => {
        setItems(initialItems);
        setHasMore(initialHasMore);
        setPage(1);
    }, [initialItems, initialHasMore]);

    const loadMore = async () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);
        try {
            const next = await fetchSubmissions({
                page: page + 1,
                limit: 12,
                query: searchQuery,
                categories: selectedCategories,
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
        <div className="space-y-12">
            {/* V8.0 LCP Area */}
            {featuredItems.length > 0 && (
                <section>
                    <FeaturedCarousel items={featuredItems} />
                </section>
            )}

            {/* Main Feed */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 min-h-[600px]">
                {items.length > 0 ? (
                    items.map((item, index) => (
                        <m.div
                            key={item.post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: (index % 6) * 0.1 }}
                        >
                            <MediaCard
                                post={item.post}
                                priority={index < 4}
                            />
                        </m.div>
                    ))
                ) : !isLoading ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                        <SearchX className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-xl font-bold text-gray-400">Nenhum rastro encontrado...</p>
                        <button onClick={() => router.push('/')} className="mt-4 text-brand-blue font-bold">Limpar Filtros</button>
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
