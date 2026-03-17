'use client';

import React from 'react';
import { ContextFeedbackCard } from '@/components/ui/ContextFeedbackCard';
import { useNavigationStore } from '@/store/useNavigationStore';

export const FluxoFeedbackCard = ({ className }: { className?: string }) => {
    const { setReportModalOpen } = useNavigationStore();

    return (
        <ContextFeedbackCard
            title="Fluxo de Partículas"
            icon={<span className="material-symbols-outlined text-2xl text-brand-blue font-bold">grain</span>}
            description="Este é o pulso do IFUSP em tempo real. Com a agilidade de uma rede social e o rigor da academia, aqui a divulgação passiva se transforma em comunicação científica interativa. O ecossistema está em construção: como podemos melhorar seu fluxo?"
            betaTag={true}
            onFeedbackClick={() => setReportModalOpen(true, 'sugestao')}
            className={className}
        />
    );
};
