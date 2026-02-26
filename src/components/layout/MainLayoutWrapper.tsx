'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomNavBar } from './BottomNavBar';

interface MainLayoutWrapperProps {
    children: React.ReactNode;
    focusMode?: boolean;
}

/**
 * Standardized structure for V4.0 Golden Master pages.
 * Ensures consistent padding, header, and footer mounting.
 */
export function MainLayoutWrapper({ children, focusMode = false }: MainLayoutWrapperProps) {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans text-gray-900 dark:text-gray-100 flex flex-col">
            <Header />
            <main className={`flex-1 w-full ${focusMode ? 'max-w-5xl' : 'max-w-7xl'} mx-auto px-4 sm:px-6 lg:px-8 py-12`}>
                {children}
            </main>
            {!focusMode && <Footer />}
            <BottomNavBar />

            {/* Nova Submissão FAB (Desktop Only — xl+) */}
            <Link
                href="/enviar"
                className="hidden xl:flex fixed bottom-8 right-8 z-[60] bg-brand-blue text-white px-6 h-14 rounded-full shadow-2xl items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all group"
                title="Lançar à Órbita"
            >
                <span className="material-symbols-outlined text-2xl group-hover:-translate-y-1 transition-transform">rocket_launch</span>
                <span className="font-bold text-sm tracking-wide">Lançar à Órbita</span>
            </Link>
        </div>
    );
}
