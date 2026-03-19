'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Landmark } from 'lucide-react';

export function InstitutoHero() {
    return (
        <section className="relative pt-8 pb-16 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-brand-blue/10 border border-brand-blue/20">
                        <Landmark className="w-8 h-8 text-brand-blue" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-brand-blue">
                        Excelência Acadêmica IFUSP
                    </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-8 leading-[0.9]">
                    O Instituto de <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-brand-blue-dark to-white opacity-90">
                        Física
                    </span> da USP
                </h1>

                <div className="max-w-3xl">
                    <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-medium mb-6">
                        Referência mundial e pioneiro no ensino, o IFUSP é o maior centro de física do Brasil, onde tradição encontra a vanguarda das fronteiras do conhecimento científico.
                    </p>
                    
                    <div className="glass-card p-8 rounded-[40px] border-white/5 bg-[#1E1E1E]/50 backdrop-blur-sm">
                        <h2 className="text-sm font-black text-white uppercase italic mb-4 tracking-wider">Sobre o Instituto</h2>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Fundado em 1934 como parte da Faculdade de Filosofia, Ciências e Letras, o Instituto de Física da USP consolidou-se como uma das instituições de pesquisa mais produtivas do país. Atualmente, abriga centenas de laboratórios de ponta e pesquisadores empenhados em desvendar desde as partículas subatômicas até a vasta estrutura do universo, mantendo um compromisso inabalável com a formação de excelência e a divulgação científica.
                        </p>
                    </div>
                </div>
            </motion.div>
            
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none" />
        </section>
    );
}
