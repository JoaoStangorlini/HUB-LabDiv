'use client';

import React from 'react';
import { Sparkles, MessageSquarePlus } from 'lucide-react';

export interface ContextFeedbackCardProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    betaTag?: boolean;
    onFeedbackClick: () => void;
    className?: string; // Permite injeção de classes como 'block lg:hidden' na página consumidora
}

export const ContextFeedbackCard = ({
    title,
    description,
    icon,
    betaTag = false,
    onFeedbackClick,
    className = ''
}: ContextFeedbackCardProps) => {
    return (
        <aside 
            className={`bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl w-full flex flex-col gap-4 ${className}`}
            aria-labelledby="feedback-card-title"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        {icon || <Sparkles className="w-5 h-5 text-brand-yellow" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 id="feedback-card-title" className="text-sm font-bold text-white uppercase tracking-widest leading-tight">
                                {title}
                            </h3>
                            {betaTag && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-brand-yellow/10 text-brand-yellow">
                                    Versão Beta
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                            {description}
                        </p>
                    </div>
                </div>
            </div>

            <button
                onClick={onFeedbackClick}
                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-2.5 px-4 rounded-lg text-xs font-bold transition-all border border-white/5 hover:border-white/10 group"
            >
                <MessageSquarePlus className="w-4 h-4 text-brand-blue group-hover:scale-110 transition-transform" />
                Deixar Feedback
            </button>
        </aside>
    );
};
