'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface Pseudonym {
    id: string;
    name: string;
    is_active: boolean;
    usage_count: number;
}

export default function PseudonymManagementPage() {
    const [pseudonyms, setPseudonyms] = useState<Pseudonym[]>([]);
    const [newName, setNewName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchPseudonyms = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('pseudonyms')
            .select('*')
            .order('usage_count', { ascending: false });

        if (!error) setPseudonyms(data || []);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchPseudonyms();
    }, []);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        const { error } = await supabase
            .from('pseudonyms')
            .insert({ name: newName.trim(), is_active: true });

        if (error) {
            toast.error("Erro ao criar pseudônimo.");
        } else {
            toast.success("Pseudônimo criado!");
            setNewName('');
            fetchPseudonyms();
        }
    };

    const toggleStatus = async (id: string, current: boolean) => {
        const { error } = await supabase
            .from('pseudonyms')
            .update({ is_active: !current })
            .eq('id', id);

        if (!error) {
            setPseudonyms(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-display font-bold text-white tracking-tight">
                    Gestão de <span className="text-brand-yellow">Pseudônimos</span>
                </h1>
                <p className="text-gray-400 mt-1">Nomes artísticos e anônimos para o fluxo interativo.</p>
            </header>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 flex gap-4">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Novo pseudônimo (ex: Quark Errante)"
                    className="flex-1 bg-black/20 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand-yellow/30"
                />
                <button
                    onClick={handleCreate}
                    className="bg-brand-yellow text-black font-bold px-6 py-3 rounded-2xl hover:bg-yellow-500 transition-all"
                >
                    Adicionar
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-10">
                    <span className="material-symbols-outlined animate-spin text-brand-yellow">progress_activity</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pseudonyms.map(p => (
                        <div key={p.id} className="bg-card-dark border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                            <div>
                                <p className={`font-bold ${p.is_active ? 'text-white' : 'text-gray-500 line-through'}`}>{p.name}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-black">Usado {p.usage_count} vezes</p>
                            </div>
                            <button
                                onClick={() => toggleStatus(p.id, p.is_active)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${p.is_active ? 'bg-green-500/10 text-green-500' : 'bg-brand-red/10 text-brand-red'}`}
                            >
                                <span className="material-symbols-outlined text-xl">{p.is_active ? 'visibility' : 'visibility_off'}</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
