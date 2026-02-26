'use client';

import React from 'react';
import { m } from 'framer-motion';

interface AtomicReactionProps {
    isActive: boolean;
    count: number;
    onClick: (e: React.MouseEvent) => void;
    size?: number;
}

export const AtomIcon = ({ filled, size = 24, className = "" }: { filled: boolean, size?: number, className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={filled ? "2.5" : "1.5"}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${className} ${filled ? 'text-brand-blue drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'text-gray-400'}`}
    >
        {/* Chromatic Aberration Layers */}
        {filled && (
            <>
                <circle cx="12" cy="12" r="1.5" className="text-brand-red opacity-50 blur-[0.5px] translate-x-[0.5px]" />
                <circle cx="12" cy="12" r="1.5" className="text-brand-yellow opacity-50 blur-[0.5px] -translate-x-[0.5px]" />
            </>
        )}
        <circle cx="12" cy="12" r="1.5" fill={filled ? "currentColor" : "none"} />
        <m.ellipse
            cx="12" cy="12" rx="9" ry="3"
            animate={filled ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            style={{ originX: "12px", originY: "12px" }}
        />
        <g transform="rotate(60 12 12)">
            {filled && (
                <ellipse cx="12" cy="12" rx="9" ry="3" className="text-brand-red opacity-30 translate-x-[1px]" />
            )}
            <m.ellipse
                cx="12" cy="12" rx="9" ry="3"
                animate={filled ? { rotate: -360 } : {}}
                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                style={{ originX: "12px", originY: "12px" }}
            />
        </g>
        <g transform="rotate(-60 12 12)">
            {filled && (
                <ellipse cx="12" cy="12" rx="9" ry="3" className="text-brand-yellow opacity-30 -translate-x-[1px]" />
            )}
            <m.ellipse
                cx="12" cy="12" rx="9" ry="3"
                animate={filled ? { rotate: 360 } : {}}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                style={{ originX: "12px", originY: "12px" }}
            />
        </g>
    </svg>
);

export const AtomicReaction = ({ isActive, count, onClick, size = 28 }: AtomicReactionProps) => {
    return (
        <m.button
            onClick={onClick}
            whileTap={{ scale: 0.8 }}
            aria-label={`Reagir com Átomo - Total: ${count}`}
            className={`flex items-center gap-2 group transition-all p-2 rounded-lg min-h-[44px] min-w-[44px] ${isActive ? 'bg-brand-blue/10' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}
        >
            <div className="relative">
                <AtomIcon filled={isActive} size={size} />
                {isActive && (
                    <m.div
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        className="absolute inset-0 bg-brand-blue rounded-full blur-md -z-10"
                    />
                )}
            </div>
            <span className={`text-xs font-bold tabular-nums ${isActive ? 'text-brand-blue' : 'text-gray-500'}`}>
                {count} {count === 1 ? 'Átomo' : 'Átomos'}
            </span>
        </m.button>
    );
};
