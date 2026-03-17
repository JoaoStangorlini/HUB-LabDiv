'use client';

import React from 'react';
import { ContextFeedbackCard } from '@/components/ui/ContextFeedbackCard';
import { useNavigationStore } from '@/store/useNavigationStore';

export function ColisorFeedbackCard({ className }: { className?: string }) {
    const setReportModalOpen = useNavigationStore(state => state.setReportModalOpen);
    
    return (
        <ContextFeedbackCard
            title="O Grande Colisor"
            description="O acelerador de conexões do Hub. Aqui o Grande Colisor reúne as principais iniciativas de comunicação e os influencers do IFUSP em um só lugar. Explore nosso sistema de oportunidades para não perder os próximos eventos, colóquios e defesas do instituto. Colida com novas ideias e conecte-se com quem faz a ciência acontecer. Como podemos calibrar esse motor de encontros? Nos conte!"
            betaTag={true}
            onFeedbackClick={() => setReportModalOpen(true, 'sugestao')}
            className={className}
        />
    );
}
