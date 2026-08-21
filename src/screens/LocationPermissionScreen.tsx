/**
 * LocationPermissionScreen — Tela de explicação de permissão de localização.
 *
 * Exibida UMA ÚNICA VEZ (primeira abertura do app) antes de qualquer
 * solicitação de permissão. Cumpre os requisitos da Play Store e boas
 * práticas do Android: o usuário deve entender o motivo da permissão
 * ANTES do diálogo nativo do sistema aparecer.
 *
 * Fluxo:
 *   Primeira abertura → LocationPermission → Login → ... → Home
 *   Demais aberturas  → Login (ou Home se já logado)
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

/** Chave salva no AsyncStorage após o usuário passar por esta tela */
export const LOCATION_ONBOARDING_KEY = 'location_onboarding_done';

// ─── Itens explicativos ───────────────────────────────────────────────────────
const PERMISSION_ITEMS = [
    {
        emoji: '📍',
        title: 'Lugares perto de você',
        description: 'Encontramos restaurantes, parques e atrações românticas próximos à sua localização atual.',
    },
    {
        emoji: '🎯',
        title: 'Sugestões personalizadas',
        description: 'Quanto mais precisa a localização, mais relevantes são os lugares recomendados para o seu date.',
    },
    {
        emoji: '🔒',
        title: 'Sua privacidade é protegida',
        description: 'A localização é usada apenas durante a busca e nunca é armazenada ou compartilhada com terceiros.',
    },
] as const;

// ─── Componente ───────────────────────────────────────────────────────────────
export function LocationPermissionScreen() {
    const navigation = useNavigation<NavProp>();
    const [requesting, setRequesting] = useState(false);

    /** Marca o onboarding como concluído e avança para o Login */
    async function markDoneAndNavigate() {
        await AsyncStorage.setItem(LOCATION_ONBOARDING_KEY, 'true');
        // reset() é mais robusto que replace() quando esta é a primeira tela da stack
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }

    /** Solicita a permissão agora (após a explicação) e avança */
    async function handleAllowLocation() {
        setRequesting(true);
        try {
            await Location.requestForegroundPermissionsAsync();
            // Independente do resultado (granted ou denied), avança.
            // O app trata a ausência de localização com fallback (São Luís centro).
        } finally {
            setRequesting(false);
            await markDoneAndNavigate();
        }
    }

    /** Avança sem pedir permissão agora — o app pedirá na primeira busca */
    async function handleSkip() {
        await markDoneAndNavigate();
    }

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

            <LinearGradient
                colors={['rgba(185, 7, 96, 0.06)', colors.background, colors.background]}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.container}>
                {/* Ícone central */}
                <View style={styles.iconWrapper}>
                    <LinearGradient
                        colors={[colors.primaryContainer, colors.primary]}
                        style={styles.iconGradient}
                    >
                        <Text style={styles.iconEmoji}>📍</Text>
                    </LinearGradient>
                </View>

                {/* Título */}
                <Text style={styles.title}>Localização para{'\n'}encontros perfeitos</Text>
                <Text style={styles.subtitle}>
                    O DateApp usa sua localização para sugerir os melhores lugares românticos perto de você.
                </Text>

                {/* Itens explicativos */}
                <View style={styles.itemsList}>
                    {PERMISSION_ITEMS.map((item) => (
                        <View key={item.emoji} style={styles.itemRow}>
                            <View style={styles.itemIconBox}>
                                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                            </View>
                            <View style={styles.itemTextBox}>
                                <Text style={styles.itemTitle}>{item.title}</Text>
                                <Text style={styles.itemDescription}>{item.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Nota legal LGPD */}
                <View style={styles.legalBox}>
                    <Text style={styles.legalText}>
                        Ao permitir, você concorda com nossa{' '}
                        <Text style={styles.legalLink}>Política de Privacidade</Text>.
                        {' '}Você pode revogar o acesso a qualquer momento nas configurações do dispositivo.
                    </Text>
                </View>

                {/* Botões */}
                <TouchableOpacity
                    style={[styles.btnPrimary, requesting && styles.btnDisabled]}
                    activeOpacity={0.85}
                    onPress={handleAllowLocation}
                    disabled={requesting}
                >
                    {requesting ? (
                        <ActivityIndicator color={colors.onPrimary} />
                    ) : (
                        <Text style={styles.btnPrimaryText}>📍 Permitir Localização</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.btnSecondary}
                    activeOpacity={0.7}
                    onPress={handleSkip}
                    disabled={requesting}
                >
                    <Text style={styles.btnSecondaryText}>Agora não</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
        alignItems: 'center',
    },

    // ── Ícone central ─────────────────────────────────────────────────────────
    iconWrapper: {
        marginBottom: spacing.xl,
    },
    iconGradient: {
        width: 88,
        height: 88,
        borderRadius: 44,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.large,
    },
    iconEmoji: {
        fontSize: 40,
    },

    // ── Cabeçalho ─────────────────────────────────────────────────────────────
    title: {
        fontFamily: typography.fontFamily.headlineExtraBold,
        fontSize: typography.fontSize.hero,
        color: colors.onSurface,
        textAlign: 'center',
        lineHeight: typography.fontSize.hero * 1.25,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.md,
        color: colors.onSurfaceVariant,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.sm,
    },

    // ── Lista de itens ────────────────────────────────────────────────────────
    itemsList: {
        alignSelf: 'stretch',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.outlineVariant,
    },
    itemIconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: `${colors.primary}12`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemEmoji: {
        fontSize: 22,
    },
    itemTextBox: {
        flex: 1,
    },
    itemTitle: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.sm,
        color: colors.onSurface,
        marginBottom: 2,
    },
    itemDescription: {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.sm,
        color: colors.onSurfaceVariant,
        lineHeight: 20,
    },

    // ── Nota legal ────────────────────────────────────────────────────────────
    legalBox: {
        alignSelf: 'stretch',
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.xs,
    },
    legalText: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 11,
        color: colors.onSurfaceVariant,
        textAlign: 'center',
        lineHeight: 16,
        opacity: 0.8,
    },
    legalLink: {
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primary,
        textDecorationLine: 'underline',
    },

    // ── Botões ────────────────────────────────────────────────────────────────
    btnPrimary: {
        alignSelf: 'stretch',
        backgroundColor: colors.primary,
        borderRadius: radius.full,
        paddingVertical: spacing.lg,
        alignItems: 'center',
        marginBottom: spacing.sm,
        ...shadows.medium,
    },
    btnDisabled: {
        opacity: 0.7,
    },
    btnPrimaryText: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.md,
        color: colors.onPrimary,
    },
    btnSecondary: {
        alignSelf: 'stretch',
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    btnSecondaryText: {
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.sm,
        color: colors.onSurfaceVariant,
    },
});
