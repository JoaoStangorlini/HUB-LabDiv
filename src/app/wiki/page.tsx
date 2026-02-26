'use client';

import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { motion } from 'framer-motion';
import Link from 'next/link';

const wikiCategories = [
    {
        title: 'Guia do Pesquisador',
        description: 'Documentação sobre como contribuir com o acervo e boas práticas de divulgação.',
        icon: 'menu_book',
        links: [
            { name: 'Manual de Envio', href: '/guia' },
            { name: 'Direitos Autorais', href: '/manual' },
            { name: 'Formatos Suportados', href: '/guia#formatos' }
        ]
    },
    {
        title: 'Iniciativas Lab-Div',
        description: 'Conheça os projetos e grupos de pesquisa vinculados ao Hub.',
        icon: 'hub',
        links: [
            { name: 'Boletim Supernova', href: '/iniciativas#supernova' },
            { name: 'Hackerspace', href: '/iniciativas#hackerspace' },
            { name: 'Acervo Histórico', href: '/iniciativas#historico' }
        ]
    },
    {
        title: 'Ciência na USP',
        description: 'Artigos técnicos e materiais de apoio sobre as pesquisas do Instituto de Física.',
        icon: 'school',
        links: [
            { name: 'Física de Partículas', href: '/?tag=Particulas' },
            { name: 'Astrofísica', href: '/?tag=AstroUSP' },
            { name: 'Física Aplicada', href: '/?tag=Aplicada' }
        ]
    }
];

export default function WikiPage() {
    return (
        <div className="bg-background-light dark:bg-[#0B1E3B] min-h-screen text-gray-900 dark:text-gray-100">
            <Header />
            <MainLayoutWrapper>
                <div className="py-12 max-w-4xl mx-auto px-4">
                    {/* Wiki Header */}
                    <div className="mb-12 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-blue/20">
                                <span className="material-symbols-outlined text-3xl font-black">library_books</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">Wiki Lab-Div</h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl leading-relaxed">
                            O repositório oficial de conhecimento do Instituto de Física. Explore guias, artigos técnicos e documentação oficial das iniciativas Lab-Div.
                        </p>
                    </div>

                    {/* Search in Wiki */}
                    <div className="relative mb-16">
                        <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-brand-blue text-2xl">search</span>
                        <input
                            type="text"
                            placeholder="Pesquisar documentação técnica..."
                            className="w-full h-16 bg-white dark:bg-white/5 border-2 border-transparent focus:border-brand-blue/30 rounded-3xl pl-16 pr-6 text-lg outline-none transition-all shadow-xl shadow-gray-200/5 dark:shadow-none"
                        />
                    </div>

                    {/* Wiki Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {wikiCategories.map((cat, idx) => (
                            <motion.div
                                key={cat.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white dark:bg-white/5 rounded-[32px] p-8 border border-gray-100 dark:border-white/10 hover:border-brand-blue/30 transition-all group"
                            >
                                <span className="material-symbols-outlined text-4xl text-brand-blue mb-6 block group-hover:scale-110 transition-transform">{cat.icon}</span>
                                <h2 className="text-2xl font-black tracking-tight mb-3 text-gray-900 dark:text-white">{cat.title}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                                    {cat.description}
                                </p>
                                <div className="space-y-4">
                                    {cat.links.map(link => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-brand-blue hover:text-white transition-all group/link"
                                        >
                                            <span className="font-bold text-sm">{link.name}</span>
                                            <span className="material-symbols-outlined text-sm group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Help Section */}
                    <div className="mt-20 p-8 bg-brand-red rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-brand-red/20">
                        <div className="max-w-md text-center md:text-left">
                            <h3 className="text-2xl font-black mb-2 italic">Não encontrou o que procurava?</h3>
                            <p className="text-white/80 text-sm">Use o botão de Reportar no topo da página ou entre em contato com a curadoria Lab-Div.</p>
                        </div>
                        <Link
                            href="mailto:labdiv@usp.br"
                            className="px-8 py-4 bg-white text-brand-red font-black rounded-2xl hover:scale-105 transition-transform whitespace-nowrap"
                        >
                            Falar com Suporte
                        </Link>
                    </div>
                </div>
            </MainLayoutWrapper>
            <Footer />
        </div>
    );
}
