'use client';

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const creators = [
    {
        name: 'Ana Silva',
        role: 'Pesquisadora do Lab Div',
        bio: 'Investigadora principal focada em metodologias de ensino de ciências para o ensino médio.',
        imagePlaceholder: 'A',
        color: 'brand-blue'
    },
    {
        name: 'Carlos Mendes',
        role: 'Bolsista do Arquivo',
        bio: 'Catalogando e digitalizando os documentos históricos do Instituto de Física da USP.',
        imagePlaceholder: 'C',
        color: 'brand-yellow'
    },
    {
        name: 'Luiza Costa',
        role: 'Desenvolvedora do Hub',
        bio: 'Criando ferramentas digitais para facilitar a comunicação científica e o acesso à informação.',
        imagePlaceholder: 'L',
        color: 'brand-red'
    },
    {
        name: 'Rafael Oliveira',
        role: 'Coordenador de Divulgação',
        bio: 'Organizador de eventos e palestras para aproximar a ciência desenvolvida na USP do público em geral.',
        imagePlaceholder: 'R',
        color: 'brand-blue'
    }
];

export function LabDivTeam() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = direction === 'left' ? -300 : 300;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="w-full animate-in fade-in zoom-in duration-500 relative group">

            {/* Left Scroll Button */}
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-white dark:hover:bg-black transition-all cursor-pointer hidden md:flex"
                aria-label="Rolar para a esquerda"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-6 pb-8 pt-4 snap-x snap-mandatory no-scrollbar px-2 scroll-smooth"
            >
                {creators.map((creator, index) => (
                    <div key={index} className="shrink-0 snap-center sm:snap-start w-[280px] flex flex-col items-center text-center group/card bg-white dark:bg-card-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                        <div className={`relative w-28 h-28 rounded-full mb-5 flex items-center justify-center text-4xl font-bold text-white bg-${creator.color} shadow-lg ring-4 ring-background-light dark:ring-background-dark outline outline-2 outline-gray-200 dark:outline-gray-800 transition-transform group-hover/card:scale-105 duration-300`}>
                            {creator.imagePlaceholder}
                            <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{creator.name}</h3>
                        <p className={`text-xs uppercase tracking-wider font-bold text-${creator.color} mb-3`}>{creator.role}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-[250px] mx-auto">
                            {creator.bio}
                        </p>
                        <div className="flex gap-3 mt-auto pt-6 opacity-50 group-hover/card:opacity-100 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-colors cursor-pointer text-gray-400">
                                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center hover:bg-brand-blue hover:text-white transition-colors cursor-pointer text-gray-400">
                                <span className="material-symbols-outlined text-[18px]">mail</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Right Scroll Button */}
            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-white dark:hover:bg-black transition-all cursor-pointer hidden md:flex"
                aria-label="Rolar para a direita"
            >
                <ChevronRight className="w-6 h-6" />
            </button>
        </div>
    );
}
