'use client';

import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    ChevronRight,
    ArrowLeft,
    Clock,
    Download,
    ExternalLink,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

// --- ELITE COMPONENTS ---

export const Breadcrumbs = ({ slug, title }: { slug: string, title: string }) => (
    <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] mb-8 text-gray-500">
        <Link href="/wiki" className="hover:text-brand-blue transition-colors">Wiki Hub</Link>
        <ChevronRight className="w-3 h-3 text-white/20" />
        <span className="text-brand-blue italic">{title}</span>
    </nav>
);

export const TechnicalAccordion = ({ title, children }: { title: string, children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <div className="border border-white/5 rounded-3xl overflow-hidden mb-4 bg-white/2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
            >
                <span className="text-sm font-black uppercase tracking-wider text-gray-200">{title}</span>
                <ChevronRight className={`w-5 h-5 text-brand-blue transition-transform duration-500 ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            <m.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                className="overflow-hidden"
            >
                <div className="px-8 pb-8 text-gray-400 text-sm leading-relaxed font-medium">
                    {children}
                </div>
            </m.div>
        </div>
    );
};

export const DataCard = ({ label, value, icon, color = 'brand-blue' }: { label: string, value: string, icon?: React.ReactNode, color?: string }) => (
    <div className={`p-6 rounded-[32px] bg-[#1E1E1E] border border-white/5 shadow-2xl ring-1 ring-${color}/10 group hover:ring-${color}/30 transition-all`}>
        <div className="flex items-center gap-4 mb-3">
            <div className={`size-10 rounded-2xl bg-${color}/10 text-${color} flex items-center justify-center`}>
                {icon || <Clock className="w-5 h-5" />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">{label}</span>
        </div>
        <div className="text-xl font-black text-white italic tracking-tighter">{value}</div>
    </div>
);

export const ActionButton = ({ label, icon, href, variant = 'primary' }: { label: string, icon: React.ReactNode, href: string, variant?: 'primary' | 'secondary' }) => {
    const isExternal = href.startsWith('http');
    return (
        <Link
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-wider transition-all active:scale-95 ${variant === 'primary'
                ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20 hover:scale-105'
                : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                }`}
        >
            {icon}
            {label}
        </Link>
    );
};

export const ContentSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <section className="mb-16">
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-8 flex items-center gap-4">
            <div className="h-8 w-1.5 bg-brand-blue rounded-full" />
            {title}
        </h2>
        <div className="space-y-6">
            {children}
        </div>
    </section>
);
