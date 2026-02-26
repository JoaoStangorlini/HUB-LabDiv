import { PHYSICS } from '@/constants/physics';

/**
 * ⚛️ ATOMIC ENERGY DECAY LOGIC (Lazy Implementation)
 * Formula: N(t) = N0 * e^(-λt)
 */

export const calculateExcitation = (
    baseExcitation: number,
    lastUpdate: string | Date,
    lambda: number = PHYSICS.DECAY_LAMBDA // Using centralized constant
) => {
    const now = new Date();
    const last = new Date(lastUpdate);

    // Calculate time diff in hours
    const hoursPassed = (now.getTime() - last.getTime()) / (1000 * 60 * 60);

    // N(t) = N0 * e^(-lambda * t)
    const currentExcitation = baseExcitation * Math.exp(-lambda * hoursPassed);

    return Math.max(0, currentExcitation);
};

export const getExcitationLevel = (excitation: number) => {
    if (excitation > PHYSICS.THRESHOLD_ACTIVATED) return 'Alta Excitação (Estado Ativado)';
    if (excitation > PHYSICS.THRESHOLD_STABLE) return 'Estável';
    return 'Baixa Energia (Decaimento Fundamental)';
};
