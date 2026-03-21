'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search
} from 'lucide-react';
import { BookOpen, Map as MapLucide, Sparkles, Info, Workflow } from 'lucide-react';
import { useTelemetry } from '@/hooks/useTelemetry';

// Components
import { WikiView } from '@/components/wiki/WikiView';
import MapClient from '@/app/mapa/MapClient';
import { ColisorClientView } from '@/app/colisor/ColisorClientView';

// Feedback Cards
import { WikiFeedbackCard } from '@/app/wiki/WikiFeedbackCard';
import { MapaFeedbackCard } from '@/app/mapa/MapaFeedbackCard';
import { ColisorFeedbackCard } from '@/app/colisor/ColisorFeedbackCard';

interface ExplorarClientProps {
    mapItems: any[];
    oportunidades: any[];
}

export function ExplorarClient({ mapItems, oportunidades }: ExplorarClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { trackEvent } = useTelemetry();
    
    // Tab State
    const [activeTab, setActiveTab] = useState<'wiki' | 'mapa' | 'colisor'>('wiki');

    // Sync state with URL
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'wiki' || tab === 'mapa' || tab === 'colisor') {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (tab: 'wiki' | 'mapa' | 'colisor') => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams);
        params.set('tab', tab);
        router.push(`/explorar?${params.toString()}`, { scroll: false });
        trackEvent('TAB_CHANGE', { tab, hub: 'explorar' });
    };

    const tabs = [
        { id: 'wiki', label: 'Wiki Hub', icon: BookOpen, color: 'brand-blue' },
        { id: 'mapa', label: 'Mapa Interativo', icon: MapLucide, color: 'brand-yellow' },
        { id: 'colisor', label: 'Grande Colisor', icon: Sparkles, color: 'brand-red' },
    ];

    const getFeedbackCard = () => {
        switch (activeTab) {
            case 'wiki': return <WikiFeedbackCard />;
            case 'mapa': return <MapaFeedbackCard />;
            case 'colisor': return <ColisorFeedbackCard />;
        }
    };

    return (
        <MainLayoutWrapper rightSidebar={getFeedbackCard()}>
            <div className="min-h-screen py-6 px-4 max-w-7xl mx-auto">
                {/* Upper Tabs Navigation */}
                <div className="sticky top-[72px] z-50 mb-8 flex justify-center">
                    <div className="bg-[#1e1e1e]/80 backdrop-blur-xl p-1.5 rounded-[28px] border border-white/5 shadow-2xl flex gap-1 items-center">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id as any)}
                                    className={`
                                        flex items-center gap-3 px-6 py-3 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all duration-300
                                        ${isActive 
                                            ? `bg-gradient-to-br ${tab.color === 'brand-blue' ? 'from-brand-blue to-blue-700' : tab.color === 'brand-yellow' ? 'from-brand-yellow to-amber-600' : 'from-brand-red to-rose-700'} text-white shadow-lg scale-105` 
                                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
                                    `}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'wiki' && <WikiView />}
                        {activeTab === 'mapa' && (
                            <div className="mt-8">
                                <MapClient initialItems={mapItems} />
                            </div>
                        )}
                        {activeTab === 'colisor' && (
                            <div className="mt-8">
                                <ColisorClientView oportunidades={oportunidades} />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </MainLayoutWrapper>
    );
}
