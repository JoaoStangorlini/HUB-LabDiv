'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useReadingExperience } from './ReadingExperienceProvider';

export function SpeechPlayer({ content }: { content: string }) {
    const { isAudioPlaying, setAudioPlaying, audioLanguage } = useReadingExperience();
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (!synth) return;

        const loadVoices = () => {
            const availableVoices = synth.getVoices();
            setVoices(availableVoices);
        };

        loadVoices();
        synth.onvoiceschanged = loadVoices;
    }, [synth]);

    useEffect(() => {
        if (!synth) return;

        if (isAudioPlaying) {
            // Clean content: remove LaTeX formulas and markdown symbols
            const cleanText = content
                .replace(/\$\$[\s\S]*?\$\$/g, '[fórmula matemática]') // Block LaTeX
                .replace(/\$.*?\$/g, '[fórmula]') // Inline LaTeX
                .replace(/#+ /g, '') // Headers
                .replace(/\*\*|\*/g, '') // Bold/Italic
                .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
                .replace(/!\[.*?\]\(.*?\)/g, '[imagem]'); // Images

            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = audioLanguage;

            // Try to find a good voice matching the selected language
            const langPrefix = audioLanguage.startsWith('pt') ? 'pt' : 'en';
            const availableVoices = voices.filter(v => v.lang.startsWith(langPrefix));
            const selectedVoice = availableVoices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || availableVoices[0] || voices[0];

            if (selectedVoice) utterance.voice = selectedVoice;

            utterance.onend = () => setAudioPlaying(false);
            utterance.onerror = () => setAudioPlaying(false);

            utteranceRef.current = utterance;
            synth.speak(utterance);
        } else {
            synth.cancel();
        }

        return () => {
            if (synth) synth.cancel();
        };
    }, [isAudioPlaying, content, voices, synth, audioLanguage, setAudioPlaying]);

    return null; // Interface is in the Toolbar
}
