'use client';
import { useState, useEffect } from 'react';

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-6 left-6 z-50 p-4 bg-white dark:bg-card-dark text-brand-blue border border-gray-100 dark:border-gray-800 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center justify-center animate-in fade-in zoom-in duration-300"
            aria-label="Voltar ao topo"
            title="Voltar ao topo"
        >
            <span className="material-symbols-outlined font-black">arrow_upward</span>
        </button>
    );
}
