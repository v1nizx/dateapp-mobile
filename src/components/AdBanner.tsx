/**
 * AdBanner — Banner do Google AdMob para usuários do plano gratuito.
 *
 * ⚠️  Este componente usa `react-native-google-mobile-ads`, que só renderiza
 *     anúncios reais em builds nativas (EAS build). No Expo Go ele será
 *     silenciosamente ignorado (não exibe nada nem quebra o app).
 *
 * Para produção:
 *   1. Crie sua conta em https://admob.google.com
 *   2. Crie um app Android → copie o App ID → EXPO_PUBLIC_ADMOB_ANDROID_APP_ID
 *   3. Crie um Ad Unit do tipo Banner → copie o Unit ID → EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID
 *   4. Faça `eas build --profile production --platform android`
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { usePlan } from '../context/PlanContext';
import { colors, spacing, radius } from '../styles/theme';

// ─── IDs de anúncio ──────────────────────────────────────────────────────────
// Em desenvolvimento: IDs de teste oficiais do Google
// Em produção: substitua pelas variáveis do .env
const BANNER_AD_UNIT_ID = Platform.select({
    android:
        process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID ||
        'ca-app-pub-3940256099942544/6300978111', // ID de teste Android
    ios:
        process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID ||
        'ca-app-pub-3940256099942544/2934735716', // ID de teste iOS
    default: 'ca-app-pub-3940256099942544/6300978111',
});

// ─── Tipos do AdMob (importação dinâmica para não quebrar no Expo Go) ─────────
let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;
let admobAvailable = false;

try {
    const admob = require('react-native-google-mobile-ads');
    BannerAd = admob.BannerAd;
    BannerAdSize = admob.BannerAdSize;
    TestIds = admob.TestIds;
    admobAvailable = true;
} catch {
    // Expo Go ou ambiente sem suporte nativo — não exibe nada
    admobAvailable = false;
}

// ─── Componente ──────────────────────────────────────────────────────────────
interface AdBannerProps {
    /** Margem vertical ao redor do banner (default: spacing.md) */
    marginVertical?: number;
}

export const AdBanner: React.FC<AdBannerProps> = ({ marginVertical }) => {
    const { isPremium } = usePlan();

    // Usuários premium não veem anúncios
    if (isPremium) return null;

    // Ambiente sem suporte nativo (Expo Go) — não renderiza
    if (!admobAvailable || !BannerAd) return null;

    return (
        <View style={[styles.container, { marginVertical: marginVertical ?? spacing.md }]}>
            <Text style={styles.label}>Publicidade</Text>
            <BannerAd
                unitId={BANNER_AD_UNIT_ID!}
                size={BannerAdSize?.BANNER ?? 'BANNER'}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: false,
                }}
                onAdLoaded={() => console.log('[AdMob] Banner carregado')}
                onAdFailedToLoad={(error: any) =>
                    console.warn('[AdMob] Falha ao carregar banner:', error)
                }
            />
        </View>
    );
};

// ─── Estilos ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: colors.tipBackground,
        borderRadius: radius.lg,
        overflow: 'hidden',
        paddingTop: 4,
    },
    label: {
        fontSize: 9,
        color: colors.textMuted,
        opacity: 0.5,
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
