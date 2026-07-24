import React, { createContext, useContext, useState, ReactNode } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type PlanType = 'free' | 'premium';

interface PlanContextData {
    plan: PlanType;
    isPremium: boolean;
    setPlan: (plan: PlanType) => void;
}

// ─── Contexto ─────────────────────────────────────────────────────────────────
const PlanContext = createContext<PlanContextData>({
    plan: 'free',
    isPremium: false,
    setPlan: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export function PlanProvider({ children }: { children: ReactNode }) {
    // Por padrão todos começam no plano gratuito.
    // Futuramente, integrar com backend/compra in-app para persistir o estado.
    const [plan, setPlan] = useState<PlanType>('free');

    return (
        <PlanContext.Provider value={{ plan, isPremium: plan === 'premium', setPlan }}>
            {children}
        </PlanContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function usePlan(): PlanContextData {
    return useContext(PlanContext);
}
