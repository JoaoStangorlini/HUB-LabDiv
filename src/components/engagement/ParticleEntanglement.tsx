'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchParticlePreview } from '@/app/actions/submissions';
import { toast } from 'react-hot-toast';

interface ParticleReference {
    id: string;
    type: 'article' | 'particle';
    title: string;
    author: string;
    energy: number;
}

export const ParticleEntanglement = () => {
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState<ParticleReference | null>(null);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    const handleAttach = async (id: string, type: 'article' | 'particle' = 'particle') => {
        const preview = await fetchParticlePreview(id);
        if (preview) {
            setAttachment({
                id,
                type,
                title: preview.title,
                author: preview.author,
                energy: preview.energy
            });
            setIsSelectorOpen(false);
        } else {
            toast.error('Partícula não encontrada no Colisor.');
        }
    };

    const handleSend = () => {
        console.log('Sending message with Context-Share:', {
            content: message,
            attachment_id: attachment?.id,
            attachment_type: attachment?.type,
            metadata: { source: 'Big Collider' }
        });
        // Implementation of Supabase insert here
        setMessage('');
        setAttachment(null);
    };

    return (
        <div className="flex flex-col h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Emaranhamento</h3>
                <span className="material-symbols-outlined text-brand-blue text-sm">hub</span>
            </div>

            {/* Chat Area - Placeholder */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="bg-white/5 p-3 rounded-2xl max-w-[80%] text-xs border border-white/5">
                    Olá! Vamos colaborar nesta pesquisa?
                </div>
            </div>

            {/* Attachment Preview (Rich Card) */}
            <AnimatePresence>
                {attachment && (
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="px-4 py-2"
                    >
                        <div className="bg-brand-blue/10 border border-brand-blue/30 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-1">
                                <button onClick={() => setAttachment(null)} className="material-symbols-outlined text-xs text-brand-blue/50 hover:text-brand-blue transition-colors">close</button>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-brand-blue/20 flex items-center justify-center text-brand-blue">
                                    <span className="material-symbols-outlined text-xl">
                                        {attachment.type === 'article' ? 'hub' : 'grain'}
                                    </span>
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-[11px] font-black text-white uppercase truncate">
                                        {attachment.title}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest truncate max-w-[120px]">Autor: {attachment.author}</span>
                                        <div className="flex items-center gap-1 bg-brand-blue/20 px-1.5 py-0.5 rounded-full">
                                            <div className="w-1 h-1 rounded-full bg-brand-blue animate-pulse"></div>
                                            <span className="text-[8px] font-black text-brand-blue uppercase">{attachment.energy} EXCITAÇÃO</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="p-4 bg-black/20">
                <div className="flex items-end gap-2">
                    <button
                        onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                        className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                        title="[🔗 Anexar Partícula] - Referenciar conteúdo técnico"
                    >
                        <span className="material-symbols-outlined text-gray-400 text-[20px]">link</span>
                    </button>

                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Mensagem emaranhada..."
                        className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-3 text-xs outline-none focus:border-brand-blue/30 transition-all resize-none max-h-24 h-10"
                    />

                    <button
                        onClick={handleSend}
                        disabled={!message.trim() && !attachment}
                        className="p-2 bg-brand-blue text-white rounded-xl shadow-lg shadow-brand-blue/20 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[20px]">send</span>
                    </button>
                </div>

                {/* Literal Label for Neurodiversity */}
                <p className="mt-2 text-[9px] text-gray-500 uppercase font-black tracking-widest text-center">
                    (Use o ícone de elo para anexar um artigo técnico)
                </p>
            </div>

            {/* Simple Selector Mockup */}
            <AnimatePresence>
                {isSelectorOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute bottom-24 left-4 right-4 bg-gray-900 border border-white/10 rounded-2xl p-4 shadow-2xl z-50"
                    >
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Selecionar Recurso</h4>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleAttach('1')}
                                className="w-full text-left p-2 bg-white/5 rounded-lg text-[10px] font-bold hover:bg-white/10"
                            >
                                🔬 Grande Colisor: Artigo Exemplo
                            </button>
                            <button
                                onClick={() => handleAttach('2')}
                                className="w-full text-left p-2 bg-white/5 rounded-lg text-[10px] font-bold hover:bg-white/10"
                            >
                                🌌 Fluxo: Partícula Exemplo
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
