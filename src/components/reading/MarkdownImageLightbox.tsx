'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MarkdownImageLightbox
 * Wraps ReactMarkdown's rendered images in a full-screen click-to-zoom modal.
 * Usage: replace `img` in ReactMarkdown components prop.
 */
export function MarkdownImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = useCallback(() => setIsOpen(true), []);
    const handleClose = useCallback(() => setIsOpen(false), []);

    return (
        <>
            {/* Inline image — clickable to zoom */}
            <img
                {...props}
                onClick={handleOpen}
                className="cursor-zoom-in rounded-xl transition-transform hover:scale-[1.02] hover:shadow-lg"
                loading="lazy"
            />

            {/* Full-screen Lightbox */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out print:hidden"
                    >
                        <motion.img
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            src={props.src}
                            alt={props.alt || ''}
                            className="max-w-[95vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
                        />
                        <button
                            onClick={handleClose}
                            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            aria-label="Fechar"
                        >
                            <span className="material-symbols-outlined text-3xl">close</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
