'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { Zap, Brain, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { wikiCells, institutoCell } from '../page'; // Reuse cells from Wiki home

const LOCKED_CELLS = ['pesquisa', 'carreira', 'ifusp', 'instituto'];

export default function QuizHubPage() {
    // Combine all cells
    const allCells = [...wikiCells, institutoCell];

    return (
        <MainLayoutWrapper>
            <div className="min-h-screen pt-24 px-4 pb-24">
                <div className="max-w-6xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-16 relative">
                        <div className="absolute top-0 rotate-180 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-red/10 blur-[120px] rounded-[100%] pointer-events-none opacity-50" />

                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-brand-red/20 bg-brand-red/10 text-brand-red font-bold text-xs uppercase tracking-[0.3em] mb-8">
                            <Zap className="w-4 h-4" />
                            Teste de Radiação
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white italic uppercase tracking-tighter mb-6 relative">
                            Hub de <span className="text-brand-red">Simulações</span>
                        </h1>

                        <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed text-sm md:text-base font-medium">
                            Selecione uma área da base de dados para extrair Radiação Específica, ou encare o Teste Geral para provar seu conhecimento integral do ecossistema IFUSP.
                        </p>
                    </div>

                    {/* Featured General Test */}
                    <div className="max-w-2xl mx-auto mb-20">
                        <Link href="/wiki/quiz/geral" className="block relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-brand-red to-brand-yellow rounded-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 blur-lg" />
                            <div className="relative p-8 md:p-12 rounded-[40px] bg-card-dark border border-white/10 flex flex-col md:flex-row items-center gap-8 group-hover:border-brand-red/50 transition-all duration-300">
                                <div className="p-6 bg-brand-red/10 rounded-3xl border border-brand-red/20 shrink-0">
                                    <Brain className="w-12 h-12 text-brand-red group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Teste Geral</h2>
                                    <p className="text-sm text-gray-400 font-medium">10 perguntas aleatórias cobrindo todo o Hub IFUSP. O teste definitivo para Veteranos e Exploradores.</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Modular Quizzes Grid */}
                    <div className="mb-12">
                        <h3 className="text-xl font-black text-white uppercase italic tracking-widest mb-8 text-center opacity-80">Testes Modulares</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {allCells.map((cell, idx) => {
                                const isLocked = LOCKED_CELLS.includes(cell.id);
                                const isInstituto = cell.id === 'instituto';
                                const colorClass = isInstituto ? `text-[#17739A]` : `text-${cell.color}`;
                                const bgClass = isInstituto ? `bg-[#17739A]/10 border-[#17739A]/20` : `bg-${cell.color}/10 border-${cell.color}/20`;
                                const hoverBorderClass = isInstituto ? `hover:border-[#17739A]/50` : `hover:border-${cell.color}/50`;

                                return (
                                    <motion.div
                                        key={cell.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: idx * 0.05 }}
                                    >
                                        {isLocked ? (
                                            <div className="p-8 rounded-[32px] bg-card-dark border border-white/5 opacity-50 relative overflow-hidden flex flex-col h-full cursor-not-allowed">
                                                <div className="flex items-center justify-between mb-6 opacity-30">
                                                    <div className={`p-4 rounded-2xl ${bgClass} ${colorClass}`}>
                                                        {cell.icon}
                                                    </div>
                                                    <Lock className="w-5 h-5 text-gray-500" />
                                                </div>
                                                <h4 className="text-lg font-black text-white italic uppercase mb-2 line-through decoration-white/20">{cell.title}</h4>
                                                <p className="text-xs text-gray-500 font-medium flex-1">
                                                    Em Desenvolvimento. O sinal de radiação nesta área ainda é instável.
                                                </p>
                                            </div>
                                        ) : (
                                            <Link href={`/wiki/quiz/${cell.id}`} className={`block p-8 rounded-[32px] bg-card-dark border border-white/10 ${hoverBorderClass} group transition-all duration-300 h-full flex flex-col hover:-translate-y-1 hover:shadow-2xl`}>
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className={`p-4 rounded-2xl ${bgClass} ${colorClass} group-hover:scale-110 transition-transform`}>
                                                        {cell.icon}
                                                    </div>
                                                    <ArrowRight className={`w-5 h-5 ${colorClass} opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all`} />
                                                </div>
                                                <h4 className={`text-lg font-black text-white italic uppercase mb-2 group-hover:${colorClass} transition-colors`}>{cell.title}</h4>
                                                <p className="text-xs text-gray-400 font-medium flex-1">
                                                    Teste seus conhecimentos sobre as diretrizes de {cell.title.toLowerCase()}.
                                                </p>
                                            </Link>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </MainLayoutWrapper>
    );
}
