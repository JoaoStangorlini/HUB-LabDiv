'use client';

import { useState, useEffect } from 'react';
import { PHYSICS } from '@/constants/physics';

/**
 * useExcitation Hook ⚛️
 * Calculates the current energy level based on the last update and decay constant.
 * Formula: N(t) = N0 * e^(-λt)
 */
export const useExcitation = (baseEnergy: number, lastUpdate: string | Date, isStable: boolean = false) => {
    const [excitation, setExcitation] = useState(baseEnergy);

    useEffect(() => {
        if (isStable) {
            setExcitation(100);
            return;
        }

        const calculateNow = () => {
            const now = new Date();
            const last = new Date(lastUpdate);
            const diffHours = (now.getTime() - last.getTime()) / (1000 * 60 * 60);

            // N(t) = N0 * exp(-lambda * t)
            const current = baseEnergy * Math.exp(-PHYSICS.DECAY_LAMBDA * diffHours);

            setExcitation(Number(current.toFixed(2)));
        };

        calculateNow();
        // Update every minute for UI fluidity if needed, but usually static is enough for single render
    }, [baseEnergy, lastUpdate, isStable]);

    const getQuantumState = () => {
        if (excitation >= PHYSICS.THRESHOLD_ACTIVATED) return 'ACTIVATED';
        if (excitation >= PHYSICS.THRESHOLD_STABLE) return 'STABLE';
        return 'DECAY';
    };

    return {
        excitation,
        state: getQuantumState(),
        isCritical: excitation < PHYSICS.THRESHOLD_STABLE
    };
};
