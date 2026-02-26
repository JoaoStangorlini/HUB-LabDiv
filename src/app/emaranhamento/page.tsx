'use client';

import React from 'react';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { Header } from '@/components/layout/Header';

export default function EmaranhamentoPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen">
            <Header />
            <MainLayoutWrapper>
                <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8">
                    <div className="size-24 rounded-full bg-brand-blue/10 flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-5xl text-brand-blue">hub</span>
                    </div>
                    <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-4">Emaranhamento de Partículas</h1>
                    <p className="text-gray-500 max-w-md mx-auto">
                        O sistema de emaranhamento para troca de referências técnicas e partículas está sendo calibrado.
                        Em breve você poderá anexar artigos do Grande Colisor e colaborar em tempo real.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-8 px-8 py-3 bg-brand-blue text-white font-bold rounded-2xl hover:opacity-90 transition-all"
                    >
                        Voltar ao Arquivo
                    </button>
                </div>
            </MainLayoutWrapper>
        </div>
    );
}
