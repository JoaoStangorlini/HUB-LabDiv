'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, User } from 'lucide-react';

interface SidebarTag {
    name: string;
    count: number;
}

interface SidebarAuthor {
    name: string;
    handle: string;
    avatar: string | null;
}

interface SidebarRightProps {
    tags: SidebarTag[];
    authors: SidebarAuthor[];
}

export const SidebarRight = ({ tags, authors }: SidebarRightProps) => {
    const [page, setPage] = React.useState(0);
    const tagsPerPage = 4;
    const totalPages = Math.ceil((tags.length || 1) / tagsPerPage);

    const currentTags = tags.slice(page * tagsPerPage, (page + 1) * tagsPerPage);

    const handleNextPage = () => {
        setPage((prev) => (prev + 1) % totalPages);
    };

    return (
        <aside className="sticky top-24 h-[calc(100vh-6rem)] w-full flex flex-col gap-6 py-6 pl-4 overflow-y-auto hidden-scrollbar">
            {/* Discovery Search */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
                <input
                    type="text"
                    placeholder="Pesquisar Partículas..."
                    className="w-full bg-gray-100 dark:bg-white/5 border border-transparent focus:border-brand-blue/30 focus:bg-white dark:focus:bg-card-dark rounded-2xl py-3 pl-12 pr-4 text-sm font-medium transition-all outline-none"
                />
            </div>

            {/* Trending Section */}
            <div className="bg-gray-50 dark:bg-white/5 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Isótopos em Órbita</h3>
                    <div className="flex gap-1">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <div key={i} className={`w-1 h-1 rounded-full transition-all ${page === i ? 'bg-brand-blue w-3' : 'bg-gray-300 dark:bg-gray-700'}`} />
                        ))}
                    </div>
                </div>

                <div className="relative h-[180px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={page}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="flex flex-col gap-4 absolute inset-0"
                        >
                            {currentTags.map((tag) => (
                                <Link
                                    key={tag.name}
                                    href={`/?tag=${tag.name}`}
                                    className="group flex flex-col hover:opacity-80 transition-opacity"
                                >
                                    <span className="text-xs text-brand-blue font-bold">#{tag.name}</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">{tag.count} contribuições</span>
                                </Link>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <button
                    onClick={handleNextPage}
                    className="block mt-4 text-xs font-bold text-brand-blue hover:underline flex items-center gap-1 group text-left"
                    title="Explorar mais isótopos"
                >
                    Explorar mais isótopos
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Who to Follow */}
            <div className="bg-gray-50 dark:bg-white/5 rounded-3xl p-5 border border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-4">Cientistas em Órbita</h3>
                <div className="flex flex-col gap-4">
                    {authors.length > 0 ? authors.map((user) => (
                        <div key={user.handle} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                {user.avatar ? (
                                    <div className="size-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-800">
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="size-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                                        <User className="w-5 h-5" />
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[100px]" title={user.name}>{user.name}</span>
                                    <span className="text-[10px] text-gray-500 truncate max-w-[100px]">{user.handle}</span>
                                </div>
                            </div>
                            <button className="px-4 py-1.5 bg-brand-blue hover:bg-brand-blue/90 text-white text-[10px] font-black rounded-full hover:scale-105 active:scale-95 transition-all">
                                Seguir
                            </button>
                        </div>
                    )) : (
                        <span className="text-xs text-gray-500">Nenhum autor disponível.</span>
                    )}
                </div>
            </div>

            {/* Footer Links */}
            <div className="px-5 py-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-400 font-medium">
                <Link href="/manual" className="hover:underline">Privacidade</Link>
                <Link href="/manual" className="hover:underline">Termos</Link>
                <Link href="/manual" className="hover:underline">Cookies</Link>
                <span>© 2026 IFUSP Lab-Div - Hub de Comunicação Científica</span>
            </div>
        </aside>
    );
};
