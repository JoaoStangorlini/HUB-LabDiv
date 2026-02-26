'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Slide {
    type: 'image' | 'markdown';
    content: string;
}

export function ImageCarouselClient({ urls, title, slides }: { urls: string[], title: string, slides?: Slide[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // V4.0 Hardening: If slides are provided, use them. Otherwise, fallback to legacy urls.
    const displayItems: Slide[] = slides || urls.map(url => ({ type: 'image', content: url }));

    const nextImage = () => setCurrentIndex(p => (p + 1) % displayItems.length);
    const prevImage = () => setCurrentIndex(p => (p - 1 + displayItems.length) % displayItems.length);

    if (displayItems.length === 0) {
        return <span className="text-white">Conteúdo não disponível</span>;
    }

    const currentItem = displayItems[currentIndex];

    return (
        <div className="relative w-full h-full flex items-center justify-center min-h-[300px] md:min-h-[500px] bg-black/20 rounded-3xl overflow-hidden">
            {currentItem.type === 'image' ? (
                <img
                    src={currentItem.content}
                    alt={`${title} - ${currentIndex + 1}`}
                    className="w-full h-full object-contain max-h-[70vh] transition-opacity duration-300"
                />
            ) : (
                <div className="w-full h-full p-8 md:p-16 flex items-center justify-center overflow-y-auto max-h-[70vh]">
                    <div className="prose prose-invert prose-lg max-w-none w-full text-center slide-content font-display">
                        <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                        >
                            {currentItem.content}
                        </ReactMarkdown>
                    </div>
                </div>
            )}

            {displayItems.length > 1 && (
                <>
                    <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-2 md:p-3 backdrop-blur-md transition-all hover:scale-110 z-20"
                    >
                        <span className="material-symbols-outlined text-2xl md:text-3xl">chevron_left</span>
                    </button>
                    <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white rounded-full p-2 md:p-3 backdrop-blur-md transition-all hover:scale-110 z-20"
                    >
                        <span className="material-symbols-outlined text-2xl md:text-3xl">chevron_right</span>
                    </button>

                    <div className="absolute bottom-6 flex gap-2 bg-black/40 px-3 py-2 rounded-full backdrop-blur-md z-20">
                        {displayItems.map((_, i) => (
                            <div
                                key={i}
                                className={`h-2.5 rounded-full cursor-pointer hover:bg-white transition-all ${i === currentIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/50'}`}
                                onClick={() => setCurrentIndex(i)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
