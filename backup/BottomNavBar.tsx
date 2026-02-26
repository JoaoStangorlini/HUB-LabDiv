'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
    { name: 'Fluxo', href: '/', icon: 'grain' },
    { name: 'Colisor', href: '/colisor', icon: 'auto_awesome' },
    { name: 'Lançar', href: '/enviar', icon: 'rocket_launch', isAction: true },
    { name: 'Laboratório', href: '/lab', icon: 'science' },
    { name: 'Mais', href: '#', icon: 'add', isDrawerTrigger: true },
];

const drawerLinks = [
    { name: 'Laboratório Pessoal', href: '/lab', icon: 'science', isPrimary: true },
    { name: 'Observatório', href: '/iniciativas', icon: 'biotech' },
    { name: 'Pergunte', href: '/perguntas', icon: 'help_outline' },
    { name: 'Criadores', href: '/criadores', icon: 'person_search' },
    { name: 'Mapa', href: '/mapa', icon: 'map' },
    { name: 'Arquivo Lab-Div', href: '/arquivo-labdiv', icon: 'science' },
    { name: 'Painel Admin', href: '/admin', icon: 'admin_panel_settings' },
];

export const BottomNavBar = () => {
    const pathname = usePathname();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <>
            <div className="xl:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 pt-2 h-24 bg-gradient-to-t from-white dark:from-background-dark via-white/80 dark:via-background-dark/80 to-transparent pointer-events-none">
                <nav className="max-w-md mx-auto h-16 bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl rounded-[32px] border border-white/20 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex items-center justify-around px-1 pointer-events-auto overflow-visible">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;

                        {/* Central rocket button */ }
                        if (item.isAction) {
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="group relative -top-6 flex flex-col items-center"
                                >
                                    <div className="size-14 bg-brand-blue rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-blue/30 transform transition-transform active:scale-90 group-hover:-translate-y-1 border-4 border-white dark:border-gray-900">
                                        <span className="material-symbols-outlined text-3xl font-black">rocket_launch</span>
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-tighter text-brand-blue mt-0.5">Lançar</span>
                                </Link>
                            );
                        }

                        {/* "Mais" drawer trigger */ }
                        if (item.isDrawerTrigger) {
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => setIsDrawerOpen(true)}
                                    className={`flex flex-col items-center justify-center gap-0.5 p-2 rounded-2xl transition-all ${isDrawerOpen ? 'text-brand-blue' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                >
                                    <span className={`material-symbols-outlined text-[22px] ${isDrawerOpen ? 'filled' : ''}`}>
                                        {item.icon}
                                    </span>
                                    <span className="text-[8px] font-black uppercase tracking-tighter">
                                        {item.name}
                                    </span>
                                </button>
                            );
                        }

                        {/* Normal nav item */ }
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-0.5 p-2 rounded-2xl transition-all relative ${isActive ? 'text-brand-blue' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                            >
                                <span className={`material-symbols-outlined text-[22px] ${isActive ? 'filled' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className="text-[8px] font-black uppercase tracking-tighter">
                                    {item.name}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="bottom-nav-indicator"
                                        className="absolute -bottom-1 w-1 h-1 rounded-full bg-brand-blue"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* "Mais" Drawer */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDrawerOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] xl:hidden"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-[40px] z-[120] p-8 xl:hidden shadow-[0_-20px_50px_rgba(0,0,0,0.3)]"
                        >
                            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-8" />

                            <div className="grid grid-cols-1 gap-2">
                                {/* Primary: Laboratório */}
                                {drawerLinks.filter(l => l.isPrimary).map(link => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsDrawerOpen(false)}
                                        className="flex items-center gap-4 p-4 bg-brand-blue rounded-3xl text-white mb-4"
                                    >
                                        <div className="size-12 rounded-full bg-white/20 flex items-center justify-center">
                                            <span className="material-symbols-outlined">{link.icon}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold">{link.name}</span>
                                            <span className="text-xs opacity-80">Editar dados e currículo técnico</span>
                                        </div>
                                        <span className="material-symbols-outlined ml-auto">chevron_right</span>
                                    </Link>
                                ))}

                                {/* Grid of other links */}
                                <div className="grid grid-cols-2 gap-3">
                                    {drawerLinks.filter(l => !l.isPrimary).map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setIsDrawerOpen(false)}
                                            className="flex flex-col gap-3 p-5 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 hover:border-brand-blue/30 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-brand-blue">{link.icon}</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{link.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setIsDrawerOpen(false)}
                                className="w-full mt-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold rounded-2xl"
                            >
                                Fechar
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
