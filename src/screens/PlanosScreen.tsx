import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    StatusBar,
    Image,
    ScrollView,
    ImageBackground,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { BottomNavBar } from '../components/BottomNavBar';

type PlanosScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Planos'>;

export function PlanosScreen() {
    const navigation = useNavigation<PlanosScreenNavigationProp>();

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleSubscribe = () => {
        Alert.alert(
            '✨ Em breve!',
            'O Plano Premium estará disponível muito em breve!\n\nContinue aproveitando as 3 buscas gratuitas por dia até lá. 💕',
            [{ text: 'Entendi, obrigado!', style: 'default' }]
        );
    };

    const handleContinueFree = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
            
            {/* TopAppBar */}
            <View style={styles.appBar}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.appBarTitle}>DateApp ✨</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>Momentos Mágicos</Text>
                    <Text style={styles.heroSubtitle}>Escolha o plano perfeito para o seu romance florescer.</Text>
                </View>

                {/* Subscription Grid */}
                <View style={styles.grid}>
                    {/* Premium Plan */}
                    <View style={styles.premiumCardContainer}>
                        <View style={styles.premiumCard}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>⭐ Melhor Escolha</Text>
                            </View>

                            <Text style={styles.planTitle}>Plano Premium 💕</Text>
                            <Text style={styles.planDesc}>A experiência completa sem limites.</Text>
                            
                            <View style={styles.priceContainer}>
                                <Text style={styles.priceValue}>R$ 29,90</Text>
                                <Text style={styles.pricePeriod}>/mês</Text>
                            </View>
                            <View style={styles.featureList}>
                                {['IA Avançada: Sugestões ultra-personalizadas.', 
                                  'Buscas Ilimitadas: Explore sem fronteiras.',
                                  'Dicas Exclusivas: Roteiros românticos premium.',
                                  'Sem Anúncios: Zero interrupções.'].map((feat, i) => (
                                    <View key={i} style={styles.featureItem}>
                                        <Text style={styles.checkIcon}>✓</Text>
                                        <Text style={styles.featureText}>{feat}</Text>
                                    </View>
                                ))}
                            </View>

                            <TouchableOpacity style={styles.premiumButton} activeOpacity={0.8} onPress={handleSubscribe}>
                                <Text style={styles.premiumButtonText}>Assinar Agora ✨</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Free Plan */}
                    <View style={styles.freeCard}>
                        <Text style={styles.freeTitle}>Plano Grátis</Text>
                        <Text style={styles.freeDesc}>Comece sua jornada romântica.</Text>
                        
                        <View style={styles.priceContainer}>
                            <Text style={styles.freePrice}>Grátis</Text>
                        </View>

                        <View style={styles.featureList}>
                            <View style={styles.featureItem}>
                                <Text style={styles.checkIconFree}>✓</Text>
                                <Text style={styles.featureTextFree}>IA Básica de recomendações.</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Text style={styles.checkIconFree}>✓</Text>
                                <Text style={styles.featureTextFree}>3 buscas por dia.</Text>
                            </View>
                            <View style={[styles.featureItem, styles.disabledFeature]}>
                                <Text style={styles.crossIcon}>✕</Text>
                                <Text style={[styles.featureTextFree, styles.strikeThrough]}>Dicas exclusivas e roteiros.</Text>
                            </View>
                            <View style={[styles.featureItem, styles.disabledFeature]}>
                                <Text style={styles.crossIcon}>✕</Text>
                                <Text style={[styles.featureTextFree, styles.strikeThrough]}>Experiência sem anúncios.</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.freeButton} onPress={handleContinueFree}>
                            <Text style={styles.freeButtonText}>Continuar com Grátis</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tip Card */}
                <View style={styles.tipCard}>
                    <Text style={styles.tipEmoji}>💡</Text>
                    <View style={styles.tipContent}>
                        <Text style={styles.tipTitle}>Dica de Casal</Text>
                        <Text style={styles.tipDesc}>Assinantes Premium encontram o date ideal 3x mais rápido através da nossa IA de afinidade.</Text>
                    </View>
                </View>

                {/* Trust Image */}
                <View style={styles.trustImageContainer}>
                    <ImageBackground 
                        source={{uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPyhVOWGLvK3iEXazozYANaEV4sD-KeO8vISzSerB73h2K-ENu_JpHSpioKBgzXmcjHL_OA7Gq4JdZz-TB9cHhNMkdmsIx0_ZFPcFrUcDscaYsWkbfcu_wKNHfgqhX3R72qP8epmr2YNzvpnYmD40JQeT7TTzm4sLG0YdCxI5s3MGnfWncSMWo4uM-tcdlFvrcR55buhxPYCVXiMM638DkoopMcRgexBFMrIO-ot1cqpENa8rJKTpA'}}
                        style={styles.trustImage}
                    >
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.6)']}
                            style={styles.trustGradient}
                        >
                            <Text style={styles.trustText}>Junte-se a mais de 10.000 casais felizes hoje.</Text>
                        </LinearGradient>
                    </ImageBackground>
                </View>
            </ScrollView>

            {/* Barra de navegação inferior */}
            <BottomNavBar />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.surface,
    },
    backButton: {
        padding: spacing.xs,
    },
    backIcon: {
        fontSize: 24,
        color: colors.primary,
    },
    appBarTitle: {
        fontFamily: typography.fontFamily.headlineBold,
        fontSize: typography.fontSize.lg,
        color: colors.primary,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: 100, // For Bottom Nav
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: spacing.md,
        marginBottom: spacing.md,
    },
    heroTitle: {
        fontFamily: typography.fontFamily.headlineExtraBold,
        fontSize: typography.fontSize.hero,
        color: colors.onSurface,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.md,
        color: colors.onSurfaceVariant,
        textAlign: 'center',
    },
    grid: {
        gap: spacing.lg,
        marginBottom: spacing.xl,
    },
    premiumCardContainer: {
        borderRadius: radius.xl,
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: colors.primary,
        ...shadows.large,
        shadowColor: colors.primary, // Premium shadow
    },
    premiumCard: {
        padding: spacing.lg,
        paddingTop: spacing.xl + spacing.lg, // espaço para o badge absoluto
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: radius.full,
        flexDirection: 'row',
        alignItems: 'center',
    },
    badgeText: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.xs,
        color: colors.onPrimary,
    },
    planTitle: {
        fontFamily: typography.fontFamily.headlineBold,
        fontSize: typography.fontSize.xl,
        color: colors.primary,
        marginBottom: 4,
    },
    planDesc: {
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.sm,
        color: colors.onSurfaceVariant,
        marginBottom: spacing.lg,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: spacing.xl,
        gap: 4,
    },
    priceValue: {
        fontFamily: typography.fontFamily.headlineExtraBold,
        fontSize: typography.fontSize.hero,
        color: colors.onSurface,
    },
    pricePeriod: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.sm,
        color: colors.onSurfaceVariant,
    },
    featureList: {
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
    },
    checkIcon: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    featureText: {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.sm,
        color: colors.onSurface,
        flex: 1,
        lineHeight: 20,
    },
    premiumButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.lg,
        borderRadius: radius.full,
        alignItems: 'center',
        ...shadows.medium,
    },
    premiumButtonText: {
        fontFamily: typography.fontFamily.headlineBold,
        fontSize: typography.fontSize.lg,
        color: colors.onPrimary,
    },
    freeCard: {
        borderRadius: radius.xl,
        backgroundColor: '#efeded', // surface-container
        borderWidth: 1,
        borderColor: colors.outlineVariant,
        padding: spacing.lg,
        ...shadows.small,
    },
    freeTitle: {
        fontFamily: typography.fontFamily.headlineBold,
        fontSize: typography.fontSize.xl,
        color: colors.onSurface,
        marginBottom: 4,
    },
    freeDesc: {
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.sm,
        color: colors.onSurfaceVariant,
        marginBottom: spacing.lg,
    },
    freePrice: {
        fontFamily: typography.fontFamily.headlineExtraBold,
        fontSize: typography.fontSize.hero,
        color: colors.onSurface,
    },
    checkIconFree: {
        color: colors.outline,
        fontSize: 16,
        fontWeight: 'bold',
    },
    featureTextFree: {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.sm,
        color: colors.onSurface,
        flex: 1,
        lineHeight: 20,
        opacity: 0.8,
    },
    disabledFeature: {
        opacity: 0.5,
    },
    crossIcon: {
        color: colors.outline,
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 2,
    },
    strikeThrough: {
        textDecorationLine: 'line-through',
    },
    freeButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
        paddingVertical: 14,
        borderRadius: radius.full,
        alignItems: 'center',
    },
    freeButtonText: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.sm,
        color: colors.primary,
    },
    tipCard: {
        flexDirection: 'row',
        backgroundColor: '#fff9ea',
        borderLeftWidth: 4,
        borderLeftColor: '#ffcc4d',
        padding: spacing.md,
        borderRadius: radius.lg,
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    tipEmoji: {
        fontSize: 24,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.sm,
        color: '#6d4c00',
    },
    tipDesc: {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.sm,
        color: '#6d4c00',
        lineHeight: 20,
    },
    trustImageContainer: {
        borderRadius: radius.xl,
        overflow: 'hidden',
        aspectRatio: 16 / 9,
        ...shadows.small,
    },
    trustImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
    },
    trustGradient: {
        padding: spacing.md,
        paddingTop: spacing.xl,
    },
    trustText: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.sm,
        color: '#ffffff',
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 10,
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.7,
    },
    navItemActive: {
        opacity: 1,
        backgroundColor: colors.secondaryContainer,
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: radius.full,
    },
    navIcon: {
        fontSize: 20,
        marginBottom: 2,
    },
    navText: {
        fontFamily: typography.fontFamily.medium,
        fontSize: 10,
        color: colors.onSurfaceVariant,
    },
    navIconActive: {
        fontSize: 20,
        marginBottom: 2,
    },
    navTextActive: {
        fontFamily: typography.fontFamily.medium,
        fontSize: 10,
        color: colors.onSecondaryContainer,
    },
});
