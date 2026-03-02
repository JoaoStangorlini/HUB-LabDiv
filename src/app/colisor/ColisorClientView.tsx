'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ColisorClientViewProps {
    oportunidades: any[] | null;
}

const getTipoConfig = (tipo: string) => {
    switch (tipo) {
        case 'palestra':
            return { color: 'brand-blue', icon: 'campaign', label: 'Palestra' };
        case 'vaga':
            return { color: 'brand-yellow', icon: 'work', label: 'Vaga' };
        case 'evento':
            return { color: 'brand-red', icon: 'event', label: 'Evento' };
        default:
            return { color: 'brand-blue', icon: 'info', label: tipo };
    }
};

export function ColisorClientView({ oportunidades }: ColisorClientViewProps) {
    return (
        <div className="py-12 max-w-5xl mx-auto px-4">
            {/* Wiki Header */}
            <div className="mb-12 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-blue/20">
                        <span className="material-symbols-outlined text-3xl font-black">network_node</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">O Grande Colisor</h1>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl leading-relaxed">
                    O repositório técnico de conhecimento estruturado do Instituto de Física. Explore a conexão entre iniciativas e oportunidades.
                </p>
            </div>

            {/* --- SEÇÃO OPORTUNIDADES --- */}
            <section className="mb-20">
                <div className="mb-8 flex items-center gap-3">
                    <span className="material-symbols-outlined text-brand-red text-3xl">event_available</span>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight">Oportunidades no IF</h2>
                </div>

                {!oportunidades || oportunidades.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-white dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800">
                        Nenhuma oportunidade cadastrada no momento.
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-3">
                        {oportunidades.map((item) => {
                            const config = getTipoConfig(item.tipo);
                            return (
                                <div key={item.id} className="bg-white dark:bg-card-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-lg transition-all border-t-4 border-t-brand-blue p-6 flex flex-col gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-${config.color}/10 text-${config.color}`}>
                                            {config.label}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{item.titulo}</h3>
                                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{item.descricao}</p>
                                    <div className="pt-4 mt-auto border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-400">{item.data}</span>
                                        {item.link && (
                                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-brand-blue text-xs font-black flex items-center gap-1 hover:underline">
                                                Ver <span className="material-symbols-outlined text-sm">open_in_new</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* --- SEÇÃO PROJETOS & ESPAÇOS --- */}
            <section>
                <div className="mb-8 flex items-center gap-3">
                    <span className="material-symbols-outlined text-brand-yellow text-3xl">hub</span>
                    <h2 className="text-2xl font-black uppercase italic tracking-tight">Iniciativas & Espaços</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Lab-Div Card */}
                    <div className="bg-white dark:bg-card-dark rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/5 hover:-translate-y-1 transition-transform group">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
                            <img src="/labdiv-logo.png" alt="Logo do Lab-Div" className="w-full h-full object-contain" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight mb-3">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red via-brand-blue to-brand-yellow">Lab-Div</span>
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                            Inspirada no CommLab do MIT, foca na comunicação científica no IFUSP. Oferece tutoria entre pares para escrita científica, apresentações e design.
                        </p>
                        <a href="https://labdiv.notion.site" target="_blank" rel="noopener noreferrer" className="text-brand-blue font-black flex items-center gap-2 group-hover:underline text-sm">
                            Acessar Notion <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>

                    {/* Hackerspace IFUSP Card */}
                    <div className="bg-white dark:bg-card-dark rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/5 hover:-translate-y-1 transition-transform group">
                        <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-4xl text-brand-green">memory</span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-3">Hackerspace IFUSP</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                            Laboratório aberto e colaborativo. Oferece Arduinos, Raspberry Pis, impressoras 3D e eletrônica para projetos de física e robótica.
                        </p>
                        <a href="https://hackerspace.if.usp.br" target="_blank" rel="noopener noreferrer" className="text-brand-green font-black flex items-center gap-2 group-hover:underline text-sm">
                            Conhecer <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* Help Section */}
            <div className="mt-20 p-10 bg-gradient-to-br from-brand-red to-brand-red/80 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-brand-red/20 border border-white/10">
                <div className="max-w-md text-center md:text-left">
                    <h3 className="text-2xl font-black mb-2 italic uppercase">Dúvidas Técnicas?</h3>
                    <p className="text-white/80 text-sm font-medium">Use o botão de Reportar no topo da página ou entre em contato com a nossa curadoria técnica.</p>
                </div>
                <Link
                    href="mailto:labdiv@usp.br"
                    className="px-8 py-4 bg-white text-brand-red font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20"
                >
                    Falar com Suporte
                </Link>
            </div>
        </div>
    );
}
