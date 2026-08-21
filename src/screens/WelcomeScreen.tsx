import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

type WelcomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const ONBOARDING_DONE_KEY = 'onboarding_done_v1';
const TOTAL_STEPS = 2;

// ─── Componente principal ─────────────────────────────────────────────────────
export function WelcomeScreen() {
    const navigation = useNavigation<WelcomeNavProp>();
    const [step, setStep] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Se já fez onboarding, pula direto para o Login.
    // Em desenvolvimento (__DEV__) sempre mostra o onboarding para facilitar testes.
    useEffect(() => {
        if (__DEV__) return;
        AsyncStorage.getItem(ONBOARDING_DONE_KEY).then((val) => {
            if (val === 'true') navigation.replace('Login');
        });
    }, []);

    function animateToStep(next: number) {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: -30, duration: 180, useNativeDriver: true }),
        ]).start(() => {
            setStep(next);
            slideAnim.setValue(30);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
            ]).start();
        });
    }

    async function finishOnboarding() {
        await AsyncStorage.setItem(ONBOARDING_DONE_KEY, 'true');
        navigation.replace('Login');
    }

    const isLast = step === TOTAL_STEPS - 1;
    const isFirst = step === 0;

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            <LinearGradient
                colors={['rgba(255, 77, 148, 0.08)', colors.background]}
                style={StyleSheet.absoluteFill}
            />

            {/* ── Barra de progresso (dots + botão Pular) ── */}
            <View style={styles.topBar}>
                <View style={{ width: 48 }} />
                <View style={styles.dotsRow}>
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                        <View
                            key={i}
                            style={[styles.dot, i === step ? styles.dotActive : styles.dotInactive]}
                        />
                    ))}
                </View>
                {!isLast ? (
                    <TouchableOpacity style={styles.skipBtn} onPress={finishOnboarding}>
                        <Text style={styles.skipText}>Pular</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 48 }} />
                )}
            </View>

            {/* ── Conteúdo animado ── */}
            <Animated.View
                style={[styles.content, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}
            >
                {/* ────────── SLIDE 0 — layout original com hero image ────────── */}
                {step === 0 && (
                    <>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoText}>DateApp ✨</Text>
                        </View>

                        <View style={styles.heroContainer}>
                            <View style={styles.heroBackdrop} />
                            <View style={styles.imageFrame}>
                                <Image
                                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALsguhUzilxYKlkjKn0hwPb3NDUmAUvi4hl6ukvboOQy_ZVtsGLVJjPYgEtfb9P1vfIotVgElFhfW5gp3FjhoAxryYvGyUvM-j5Uobfub73OQjfuHFosH5_pkpU2nZhf6Setdc21jbXbcd9cxX_GsvBPp8YqbXlZR5f_-QIRnxu4QXlqOq2SUR4EJcSmorC8S6ywqr7jStUsA6lY_CKVphPMWhKwgXVkA5scnoqp_h1_lmv4hJC9zY' }}
                                    style={styles.heroImage}
                                />
                            </View>
                            <View style={styles.floatingBadge}>
                                <Text style={styles.badgeText}>❤️ Combinação 98%</Text>
                            </View>
                        </View>

                        <View style={styles.textContainer}>
                            <Text style={styles.title}>Crie momentos{'\n'}inesquecíveis</Text>
                            <Text style={styles.subtitle}>
                                Nossa IA mágica planeja o encontro perfeito, do restaurante ao roteiro. 💕
                            </Text>
                        </View>
                    </>
                )}

                {/* ────────── SLIDE 1 — como funciona ────────── */}
                {step === 1 && (
                    <View style={styles.newSlideContent}>
                        <View style={styles.iconRing}>
                            <LinearGradient
                                colors={[colors.primaryContainer, colors.primary]}
                                style={styles.iconGradient}
                            >
                                <Text style={styles.iconEmoji}>✨</Text>
                            </LinearGradient>
                        </View>

                        <Text style={styles.title}>Tudo que vocês{'\n'}precisam</Text>
                        <Text style={styles.subtitle}>
                            Em segundos, encontramos as melhores opções perto de você.
                        </Text>

                        <View style={styles.featuresList}>
                            {[
                                { emoji: '🎯', label: 'Personalize seu date', desc: 'Orçamento, tipo e clima da noite' },
                                { emoji: '🤖', label: 'IA Romântica', desc: 'Sugestões únicas para o casal' },
                                { emoji: '📍', label: 'Lugares incríveis', desc: 'Restaurantes, parques, aventuras' },
                            ].map((f) => (
                                <View key={f.emoji} style={styles.featureCard}>
                                    <View style={styles.featureIconBox}>
                                        <Text style={styles.featureEmoji}>{f.emoji}</Text>
                                    </View>
                                    <View style={styles.featureTextBox}>
                                        <Text style={styles.featureLabel}>{f.label}</Text>
                                        <Text style={styles.featureDesc}>{f.desc}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </Animated.View>

            {/* ── Rodapé com botões ── */}
            <View style={styles.footer}>
                {isLast ? (
                    <TouchableOpacity
                        style={styles.btnPrimary}
                        activeOpacity={0.85}
                        onPress={finishOnboarding}
                    >
                        <Text style={styles.btnPrimaryText}>Começar a explorar ✨</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity
                            style={styles.btnPrimary}
                            activeOpacity={0.85}
                            onPress={() => animateToStep(step + 1)}
                        >
                            <Text style={styles.btnPrimaryText}>Próximo →</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnSecondary} onPress={finishOnboarding}>
                            <Text style={styles.btnSecondaryText}>
                                Já tenho conta —{' '}
                                <Text style={styles.btnSecondaryLink}>Entrar</Text>
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
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

    // ── Barra superior ────────────────────────────────────────────────────────
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xs,
    },
    dotsRow: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    dot: {
        height: 6,
        borderRadius: 3,
    },
    dotActive: {
        width: 28,
        backgroundColor: colors.primary,
    },
    dotInactive: {
        width: 8,
        backgroundColor: colors.outlineVariant,
    },
    skipBtn: {
        width: 48,
        alignItems: 'flex-end',
    },
    skipText: {
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.sm,
        color: colors.onSurfaceVariant,
    },

    // ── Área de conteúdo animado ──────────────────────────────────────────────
    content: {
        flex: 1,
    },

    // ── Slide 0 — layout original ─────────────────────────────────────────────
    logoContainer: {
        marginTop: spacing.sm,
        marginBottom: spacing.md,
        alignItems: 'center',
    },
    logoText: {
        fontFamily: typography.fontFamily.headlineBold,
        fontSize: typography.fontSize.title,
        color: colors.primary,
        textAlign: 'center',
    },
    heroContainer: {
        width: width * 0.78,
        height: width * 0.78,
        alignSelf: 'center',
        marginBottom: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroBackdrop: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: colors.primaryContainer,
        borderRadius: 36,
        transform: [{ rotate: '3deg' }],
        opacity: 0.2,
    },
    imageFrame: {
        width: '100%',
        height: '100%',
        borderRadius: 36,
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: '#ffffff',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.15,
        shadowRadius: 40,
        elevation: 10,
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    floatingBadge: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: '#ffffff',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: radius.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 5,
    },
    badgeText: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.sm,
        color: colors.primary,
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },

    // ── Slides 1 e 2 — layout com ícone + cards ───────────────────────────────
    newSlideContent: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },
    iconRing: {
        marginBottom: spacing.lg,
        ...shadows.large,
    },
    iconGradient: {
        width: 88,
        height: 88,
        borderRadius: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconEmoji: {
        fontSize: 40,
    },

    // ── Textos compartilhados ─────────────────────────────────────────────────
    title: {
        fontFamily: typography.fontFamily.headlineExtraBold,
        fontSize: typography.fontSize.hero,
        color: colors.onSurface,
        textAlign: 'center',
        lineHeight: typography.fontSize.hero * 1.2,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.md,
        color: colors.onSurfaceVariant,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.sm,
    },

    // ── Cards de features ─────────────────────────────────────────────────────
    featuresList: {
        alignSelf: 'stretch',
        gap: spacing.sm,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.outlineVariant,
    },
    featureIconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: `${colors.primary}12`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureEmoji: {
        fontSize: 22,
    },
    featureTextBox: {
        flex: 1,
    },
    featureLabel: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.sm,
        color: colors.onSurface,
        marginBottom: 2,
    },
    featureDesc: {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.sm,
        color: colors.onSurfaceVariant,
        lineHeight: 18,
    },

    // ── Nota legal (slide 2) ──────────────────────────────────────────────────
    legalBox: {
        marginTop: spacing.lg,
        paddingHorizontal: spacing.xs,
    },
    legalText: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 11,
        color: colors.onSurfaceVariant,
        textAlign: 'center',
        lineHeight: 17,
        opacity: 0.75,
    },

    // ── Rodapé com botões ─────────────────────────────────────────────────────
    footer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
        paddingTop: spacing.md,
        gap: spacing.xs,
    },
    btnPrimary: {
        backgroundColor: colors.primary,
        borderRadius: radius.full,
        paddingVertical: spacing.lg,
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 8,
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
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    btnSecondaryText: {
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.sm,
        color: colors.onSurfaceVariant,
        textAlign: 'center',
    },
    btnSecondaryLink: {
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primary,
    },
});
