'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutGrid,
    FlaskConical,
    Network,
    Microscope,
    HelpCircle,
    UserSearch,
    Map,
    ShieldAlert,
    MessageSquare,
    MessageCircle,
    Mail
} from 'lucide-react';

const mainLinks = [
    { name: 'Fluxo', href: '/', icon: <LayoutGrid className="w-6 h-6" /> },
    { name: 'Lab-Div', href: '/arquivo-labdiv', icon: <FlaskConical className="w-6 h-6" /> },
    { name: 'Grande Colisor', href: '/colisor', icon: <Network className="w-6 h-6" /> },
    { name: 'Observatório', href: '/iniciativas', icon: <Microscope className="w-6 h-6" /> },
    { name: 'Pergunte', href: '/perguntas', icon: <HelpCircle className="w-6 h-6" /> },
    { name: 'Criadores', href: '/criadores', icon: <UserSearch className="w-6 h-6" /> },
    { name: 'Mapa', href: '/mapa', icon: <Map className="w-6 h-6" /> },
];

const secondaryLinks = [
    { name: 'Painel Admin', href: '/admin', icon: <ShieldAlert className="w-5 h-5" /> },
];

export const SidebarLeft = ({ userId }: { userId?: string }) => {
    const pathname = usePathname();

    return (
        <aside className="sticky top-24 h-[calc(100vh-6rem)] w-full flex flex-col gap-8 py-6 pr-4 overflow-y-auto hidden-scrollbar">
            {/* Primary Navigation */}
            <nav className="flex flex-col gap-1">
                {mainLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group ${isActive ? 'bg-brand-blue/10 text-brand-blue' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                        >
                            <span className={`transition-transform group-hover:scale-110 ${isActive ? 'text-brand-blue' : ''}`}>
                                {link.icon}
                            </span>
                            <span className={`font-bold text-base ${isActive ? 'text-gray-900 dark:text-white' : ''}`}>
                                {link.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Entanglement Section */}
            <div className="px-4 mt-4">
                <Link
                    href="/emaranhamento"
                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group mb-4 ${pathname === '/emaranhamento' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                >
                    <Network className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col overflow-hidden">
                        <span className="font-bold text-sm">Emaranhamento</span>
                        <span className="text-[9px] opacity-60 uppercase tracking-wider font-bold truncate">Conversas Recentes</span>
                    </div>
                    <div className="ml-auto size-1.5 rounded-full bg-brand-blue animate-pulse" />
                </Link>

                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 ml-1">Partículas Emaranhadas</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-2 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 opacity-50">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-500">Sem conexões ativas</span>
                            <span className="text-[10px] text-gray-400">Inicie um emaranhamento</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Suporte e Dúvidas */}
            <div className="px-4 mt-auto mb-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Suporte do hub</h3>
                <div className="space-y-1">
                    <a href="https://wa.me/5511968401823" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400 transition-colors group">
                        <MessageCircle className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                        <span className="font-bold">WhatsApp Direto</span>
                    </a>
                    <a href="mailto:labdiv@usp.br" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-brand-red/10 hover:text-brand-red transition-colors group">
                        <Mail className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                        <span className="font-bold">E-mail Institucional</span>
                    </a>
                </div>
            </div>

            {/* Secondary/Institutional Links */}
            <nav className="border-t border-gray-100 dark:border-gray-800 pt-6 flex flex-col gap-1">
                {secondaryLinks.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-brand-blue transition-colors group"
                    >
                        <span className="opacity-60 group-hover:opacity-100">
                            {link.icon}
                        </span>
                        <span className="font-medium">{link.name}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
};
