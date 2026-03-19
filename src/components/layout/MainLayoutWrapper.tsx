'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from './Header';
import { Footer } from './Footer';
import { SidebarLeft } from './SidebarLeft';
import { BottomNavBar } from './BottomNavBar';

interface MainLayoutWrapperProps {
    children: React.ReactNode;
    focusMode?: boolean;
    wide?: boolean; // New prop for broader layouts
    userId?: string;
    rightSidebar?: React.ReactNode;
}

/**
 * Standardized structure for V4.0 Golden Master pages.
 * Ensures consistent padding, header, and footer mounting.
 */
export function MainLayoutWrapper({ children, focusMode = false, wide = false, userId, rightSidebar }: MainLayoutWrapperProps) {
    return (
        <div className="min-h-screen bg-transparent font-sans text-gray-900 dark:text-gray-100 flex flex-col">
            <Header />

            {!focusMode ? (
                <div className="flex-1 w-full max-w-[1920px] mx-auto flex justify-center">
                    {/* Left Sidebar (Desktop) */}
                    <aside className="hidden xl:block w-[280px] shrink-0 border-r border-gray-200 dark:border-gray-800 bg-transparent">
                        <div className="sticky top-0">
                            <SidebarLeft userId={userId} />
                        </div>
                    </aside>

                    {/* Content Area */}
                    <main className={`flex-1 ${wide ? 'max-w-[1400px]' : 'max-w-[800px]'} w-full px-4 sm:px-6 pt-20 pb-8 lg:pb-12 transition-all duration-500`}>
                        {children}
                    </main>

                    {/* Right Sidebar */}
                    <aside className="hidden lg:block w-[320px] shrink-0 px-4 py-8 border-l border-gray-200 dark:border-gray-800 bg-transparent">
                        <div className="sticky top-24 pt-4">
                            {rightSidebar}
                        </div>
                    </aside>
                </div>
            ) : (
                <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {children}
                </main>
            )}

            {!focusMode && <Footer />}
            <BottomNavBar />

            {/* Nova Submissão FAB (Desktop Only — xl+) */}
            {!focusMode && (
                <Link
                    href="/enviar"
                    className="hidden xl:flex fixed bottom-8 right-8 z-[60] bg-brand-blue text-white px-6 h-14 rounded-full shadow-2xl items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all group"
                    title="Lançar à Órbita"
                >
                    <span className="material-symbols-outlined text-2xl group-hover:-translate-y-1 transition-transform">rocket_launch</span>
                    <span className="font-bold text-sm tracking-wide">Lançar à Órbita</span>
                </Link>
            )}
        </div>
    );
}
