/**
 * useSearchLimit — Controla o limite de buscas diárias para o plano gratuito.
 *
 * Regras:
 *  - Plano Free: máximo de 3 buscas por dia.
 *  - Plano Premium: sem limite.
 *  - O contador é salvo no AsyncStorage e resetado automaticamente quando
 *    a data muda (à meia-noite local).
 *
 * Chave do AsyncStorage: "search_limit" → { count: number; date: string }
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlan } from '../context/PlanContext';

const STORAGE_KEY = 'search_limit';
const MAX_FREE_SEARCHES = 3;

interface SearchLimitData {
    count: number;
    date: string; // 'YYYY-MM-DD'
}

interface UseSearchLimitReturn {
    /** Buscas restantes hoje (null = ilimitado para premium) */
    remaining: number | null;
    /** Se o limite diário foi atingido */
    isLimitReached: boolean;
    /** Buscas já usadas hoje */
    usedToday: number;
    /** Registra uma nova busca — chame APÓS a busca completar com sucesso */
    registerSearch: () => Promise<void>;
    /** Reseta o contador (útil para testes) */
    resetCounter: () => Promise<void>;
}

function getTodayString(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function useSearchLimit(): UseSearchLimitReturn {
    const { isPremium } = usePlan();
    const [usedToday, setUsedToday] = useState(0);

    // ── Carrega o contador do AsyncStorage ao montar ──────────────────────────
    useEffect(() => {
        if (isPremium) return; // premium não precisa controlar

        async function loadCounter() {
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                if (!raw) {
                    setUsedToday(0);
                    return;
                }
                const data: SearchLimitData = JSON.parse(raw);
                const today = getTodayString();

                // Se a data salva é de outro dia, reseta o contador
                if (data.date !== today) {
                    await AsyncStorage.removeItem(STORAGE_KEY);
                    setUsedToday(0);
                } else {
                    setUsedToday(data.count);
                }
            } catch {
                // Se der erro na leitura, começa do zero
                setUsedToday(0);
            }
        }

        loadCounter();
    }, [isPremium]);

    // ── Registra uma nova busca ───────────────────────────────────────────────
    const registerSearch = useCallback(async () => {
        if (isPremium) return; // premium não conta

        const today = getTodayString();
        const newCount = usedToday + 1;

        const data: SearchLimitData = { count: newCount, date: today };
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {
            // Silencioso — não bloqueia o uso em caso de erro de storage
        }
        setUsedToday(newCount);
    }, [isPremium, usedToday]);

    // ── Reseta o contador ─────────────────────────────────────────────────────
    const resetCounter = useCallback(async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setUsedToday(0);
    }, []);

    // ── Valores derivados ─────────────────────────────────────────────────────
    if (isPremium) {
        return {
            remaining: null,        // null = ilimitado
            isLimitReached: false,
            usedToday: 0,
            registerSearch,
            resetCounter,
        };
    }

    const remaining = Math.max(0, MAX_FREE_SEARCHES - usedToday);
    const isLimitReached = usedToday >= MAX_FREE_SEARCHES;

    return {
        remaining,
        isLimitReached,
        usedToday,
        registerSearch,
        resetCounter,
    };
}
