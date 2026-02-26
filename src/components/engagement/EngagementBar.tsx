'use client';

import React, { useState, useEffect } from 'react';
import { AtomicReaction } from './AtomicReaction';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

interface EngagementBarProps {
    submissionId: string;
    userId: string | undefined;
    receiverId?: string;
    reactionsSummary?: Record<string, number>;
    energyTotal?: number;
}

/**
 * Standardized Engagement Bar for V4.0.
 * Handles primary Atomic Reaction and secondary reaction types.
 */
export function EngagementBar({
    submissionId,
    userId,
    receiverId,
    reactionsSummary = {},
    energyTotal = 0
}: EngagementBarProps) {
    const router = useRouter();
    const [isReacting, setIsReacting] = useState(false);

    // Total count managed by state
    const [count, setCount] = useState(energyTotal);
    const [hasReacted, setHasReacted] = useState(false);

    // Initial check for user reaction
    useEffect(() => {
        const checkReaction = async () => {
            if (!userId) return;
            // In V4.0, we query the likes table directly for quick check
            const { data } = await supabase
                .from('curtidas')
                .select('id')
                .eq('submission_id', submissionId)
                .eq('user_id', userId)
                .maybeSingle();

            setHasReacted(!!data);
        };
        checkReaction();
    }, [submissionId, userId]);

    const handleAtomicClick = async () => {
        if (!userId) {
            toast.error("Faça login para interagir!", { duration: 2000 });
            const currentPath = window.location.pathname + window.location.search;
            router.push(`/login?next=${encodeURIComponent(currentPath)}`);
            return;
        }

        if (isReacting) return;

        // Optimistic UI
        const prevReacted = hasReacted;
        const prevCount = count;
        setHasReacted(!prevReacted);
        setCount(prevReacted ? Math.max(0, prevCount - 1) : prevCount + 1);

        setIsReacting(true);
        try {
            // Using V4 RPC which is more robust
            const { data, error } = await supabase.rpc('atomic_excitation_v4', {
                sub_id: submissionId,
                user_id: userId,
                react_type: 'primary'
            });

            if (error) throw error;

            // Sync with actual DB state if possible, or keep optimistic if return is void
            if (data && typeof data.new_count === 'number') {
                setCount(data.new_count);
            }
        } catch (err) {
            console.error('Error reacting:', err);
            setHasReacted(prevReacted);
            setCount(prevCount);
            toast.error("Erro ao processar interação.");
        } finally {
            setIsReacting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-10 border-t border-b border-gray-100 dark:border-gray-800 my-8 gap-4 bg-gray-50/50 dark:bg-white/5 rounded-3xl">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Reagente Atômico</span>
            <AtomicReaction
                isActive={hasReacted}
                count={count}
                onClick={handleAtomicClick}
                size={42}
            />
            <p className="text-[10px] text-gray-500 font-medium tracking-tight">Acumule energia atômica reagindo a este trabalho</p>
        </div>
    );
}
