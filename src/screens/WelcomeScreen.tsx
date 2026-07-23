import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

const { width } = Dimensions.get('window');

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export function WelcomeScreen() {
    const navigation = useNavigation<WelcomeScreenNavigationProp>();

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            <LinearGradient
                colors={['rgba(255, 77, 148, 0.08)', colors.background]}
                style={styles.bgGradient}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>DateApp ✨</Text>
                </View>

                {/* Hero Image */}
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

                {/* Texto */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Crie momentos{'\n'}inesquecíveis</Text>
                    <Text style={styles.subtitle}>
                        Nossa IA mágica planeja o encontro perfeito, do restaurante ao roteiro. 💕
                    </Text>
                </View>

                {/* Dots de progresso */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressDot, styles.progressDotActive]} />
                    <View style={styles.progressDot} />
                    <View style={styles.progressDot} />
                </View>

                {/* Botão CTA */}
                <TouchableOpacity
                    style={styles.button}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.buttonText}>Começar ✨</Text>
                </TouchableOpacity>

                <Text style={styles.loginText}>
                    Já tem uma conta?{' '}
                    <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
                        Entrar
                    </Text>
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    bgGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    logoContainer: {
        marginTop: spacing.lg,
        marginBottom: spacing.lg,
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
        marginBottom: spacing.xl,
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
        paddingHorizontal: spacing.sm,
        marginBottom: spacing.lg,
    },
    title: {
        fontFamily: typography.fontFamily.headlineExtraBold,
        fontSize: typography.fontSize.hero,
        color: colors.onSurface,
        textAlign: 'center',
        marginBottom: spacing.sm,
        lineHeight: typography.fontSize.hero * 1.2,
    },
    subtitle: {
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.md,
        color: colors.onSurfaceVariant,
        textAlign: 'center',
        lineHeight: 24,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: spacing.lg,
        gap: spacing.xs,
    },
    progressDot: {
        width: 8,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.outlineVariant,
    },
    progressDotActive: {
        width: 32,
        backgroundColor: colors.primary,
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.lg,
        borderRadius: radius.full,
        alignItems: 'center',
        alignSelf: 'stretch',
        marginBottom: spacing.md,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 8,
    },
    buttonText: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.md,
        color: colors.onPrimary,
    },
    loginText: {
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.sm,
        color: colors.onSurfaceVariant,
        textAlign: 'center',
    },
    loginLink: {
        fontFamily: typography.fontFamily.headlineBold,
        color: colors.primary,
    },
});
