import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    StatusBar,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

// Firebase
import { auth } from '../config/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithCredential,
    AuthErrorCodes,
} from 'firebase/auth';

// expo-auth-session Google
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

// ─── Traduz códigos de erro do Firebase ───────────────────────────────────────
function getFirebaseErrorMessage(code: string): string {
    switch (code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Senha incorreta. Verifique e tente novamente. 🔒';
        case 'auth/user-not-found':
            return 'Nenhuma conta encontrada com este e-mail. Cadastre-se primeiro! 📧';
        case 'auth/invalid-email':
            return 'E-mail inválido. Verifique o formato.';
        case 'auth/user-disabled':
            return 'Esta conta foi desativada. Entre em contato com o suporte.';
        case 'auth/too-many-requests':
            return 'Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente. ⏳';
        case 'auth/network-request-failed':
            return 'Sem conexão com a internet. Verifique sua rede. 🌐';
        case 'auth/email-already-in-use':
            return 'Este e-mail já está cadastrado. Faça login ou use outro e-mail.';
        case 'auth/weak-password':
            return 'Senha muito fraca. Use pelo menos 6 caracteres.';
        case 'auth/operation-not-allowed':
            return 'Método de login não permitido. Contate o suporte.';
        default:
            return 'Ocorreu um erro inesperado. Tente novamente.';
    }
}

// ─── Componente de mensagem de erro ──────────────────────────────────────────
interface ErrorBannerProps {
    message: string;
    onDismiss: () => void;
}
const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onDismiss }) => (
    <TouchableOpacity style={styles.errorBanner} onPress={onDismiss} activeOpacity={0.9}>
        <Text style={styles.errorBannerIcon}>⚠️</Text>
        <Text style={styles.errorBannerText}>{message}</Text>
        <Text style={styles.errorBannerDismiss}>✕</Text>
    </TouchableOpacity>
);

// ─── Tela principal ───────────────────────────────────────────────────────────
export function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);

    const navigation = useNavigation<LoginScreenNavigationProp>();

    // Google OAuth
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,           // Expo Go / Web
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID, // build Android
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,         // build iOS
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            setLoading(true);
            setErrorMessage(null);
            signInWithCredential(auth, credential)
                .then(() => navigation.navigate('Home'))
                .catch((error: any) => {
                    setErrorMessage(getFirebaseErrorMessage(error.code));
                })
                .finally(() => setLoading(false));
        }
    }, [response]);

    const clearErrors = () => {
        setErrorMessage(null);
        setEmailError(false);
        setPasswordError(false);
    };

    const handleEmailAuth = async (isSignUp: boolean) => {
        clearErrors();

        // Validação básica
        let hasError = false;
        if (!email.trim()) { setEmailError(true); hasError = true; }
        if (!password) { setPasswordError(true); hasError = true; }
        if (hasError) {
            setErrorMessage('Preencha e-mail e senha para continuar.');
            return;
        }

        setLoading(true);
        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email.trim(), password);
            } else {
                await signInWithEmailAndPassword(auth, email.trim(), password);
            }
            navigation.navigate('Home');
        } catch (error: any) {
            console.error('Auth Error:', error.code, error.message);
            const msg = getFirebaseErrorMessage(error.code);
            setErrorMessage(msg);

            // Destaca o campo com erro
            const code: string = error.code ?? '';
            if (code.includes('password') || code.includes('credential')) {
                setPasswordError(true);
            } else if (code.includes('email') || code.includes('user-not-found')) {
                setEmailError(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        clearErrors();
        if (!request) {
            setErrorMessage('Configurando autenticação com Google, aguarde...');
            return;
        }
        promptAsync();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <LinearGradient
                colors={['#ffd9e2', '#fbf9f8']}
                style={styles.gradientBg}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── Header ── */}
                    <View style={styles.header}>
                        <View style={styles.logoIconContainer}>
                            <Text style={styles.logoIcon}>❤️</Text>
                        </View>
                        <Text style={styles.appTitle}>DateApp ✨</Text>
                        <Text style={styles.appSubtitle}>Encontre a sua próxima noite mágica</Text>
                    </View>

                    {/* ── Card principal ── */}
                    <View style={styles.authCard}>
                        <View style={styles.welcomeHeader}>
                            <Text style={styles.welcomeTitle}>Bem-vindo(a) 💕</Text>
                            <Text style={styles.welcomeSubtitle}>Entre para descobrir novos momentos</Text>
                        </View>

                        {/* ── Banner de erro ── */}
                        {errorMessage && (
                            <ErrorBanner
                                message={errorMessage}
                                onDismiss={clearErrors}
                            />
                        )}

                        {/* ── Google Login ── */}
                        <View style={styles.socialContainer}>
                            <TouchableOpacity
                                style={styles.googleButton}
                                onPress={handleGoogleLogin}
                                disabled={loading}
                            >
                                <Image
                                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpQjZA7Z-9yvle4Obl_BqFaMeTvhvVRM0kBRK9XJwnmfGcAkZwz13FJJ9FFw_105Ou1MSKXtTJa-ldF2JDmSSH7a3uMSvlFBuiFrjH2uP0qFpHdt6ORyc72gmwORKNdZlviQduKCoLKR0_im-QbS4vkrPb_pyvUClrqYzTbDcLDczWpv6Uwv9oQ4871Krl16lUOjm-f5VNzhU8yINTk63BTcgtf9AyDJne163OxPh3mhv1CUw3Vk2Z' }}
                                    style={styles.socialIcon}
                                />
                                <Text style={styles.googleText}>Entrar com Google</Text>
                            </TouchableOpacity>
                        </View>

                        {/* ── Divider ── */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OU E-MAIL</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* ── Formulário ── */}
                        <View style={styles.formContainer}>
                            {/* E-mail */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>📧 E-mail</Text>
                                <TextInput
                                    style={[styles.input, emailError && styles.inputError]}
                                    placeholder="seu@email.com"
                                    placeholderTextColor="rgba(27, 28, 28, 0.4)"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    value={email}
                                    onChangeText={(t) => { setEmail(t); setEmailError(false); setErrorMessage(null); }}
                                    editable={!loading}
                                />
                            </View>

                            {/* Senha */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>🔒 Senha</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={[styles.passwordInput, passwordError && styles.inputError]}
                                        placeholder="••••••••"
                                        placeholderTextColor="rgba(27, 28, 28, 0.4)"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={(t) => { setPassword(t); setPasswordError(false); setErrorMessage(null); }}
                                        editable={!loading}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeButton}
                                        onPress={() => setShowPassword(!showPassword)}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Esqueci a senha */}
                            <TouchableOpacity style={styles.forgotPasswordContainer}>
                                <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
                            </TouchableOpacity>

                            {/* Botão Entrar */}
                            <TouchableOpacity
                                style={[styles.loginButton, loading && styles.loginButtonLoading]}
                                activeOpacity={0.85}
                                onPress={() => handleEmailAuth(false)}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color={colors.onPrimary} />
                                ) : (
                                    <Text style={styles.loginButtonText}>Entrar agora ✨</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* ── Cadastro ── */}
                        <View style={styles.signUpPrompt}>
                            <Text style={styles.signUpText}>
                                Ainda não tem conta?{' '}
                                <Text
                                    style={styles.signUpLink}
                                    onPress={() => navigation.navigate('Register')}
                                >
                                    Cadastre-se
                                </Text>
                            </Text>
                        </View>
                    </View>

                    {/* ── Termos ── */}
                    <View style={styles.termsContainer}>
                        <Text style={styles.termsText}>
                            Ao continuar, você concorda com nossos{' '}
                            <Text style={styles.termsLink}>Termos de Serviço</Text>
                            {' '}e{' '}
                            <Text style={styles.termsLink}>Política de Privacidade</Text>.
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    gradientBg: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xxl,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Header ──────────────────────────────────────────────────────────────
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    logoIconContainer: {
        backgroundColor: colors.card,
        padding: spacing.lg,
        borderRadius: radius.full,
        marginBottom: spacing.md,
        ...shadows.small,
    },
    logoIcon: { fontSize: 40 },
    appTitle: {
        fontFamily: typography.fontFamily.headlineBold,
        fontSize: typography.fontSize.xl,
        color: colors.primary,
        letterSpacing: -0.5,
    },
    appSubtitle: {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.md,
        color: colors.onSurfaceVariant,
        opacity: 0.8,
        marginTop: 4,
    },

    // ── Card ─────────────────────────────────────────────────────────────────
    authCard: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: colors.card,
        borderRadius: 32,
        padding: spacing.lg,
        ...shadows.medium,
    },
    welcomeHeader: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    welcomeTitle: {
        fontFamily: typography.fontFamily.headlineBold,
        fontSize: typography.fontSize.lg,
        color: colors.onSurface,
    },
    welcomeSubtitle: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.sm,
        color: colors.onSurfaceVariant,
        marginTop: 4,
    },

    // ── Banner de erro ────────────────────────────────────────────────────
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff0f3',
        borderWidth: 1,
        borderColor: '#ffb1c7',
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        gap: spacing.xs,
    },
    errorBannerIcon: {
        fontSize: 16,
    },
    errorBannerText: {
        flex: 1,
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.sm,
        color: '#7a1035',
        lineHeight: 20,
    },
    errorBannerDismiss: {
        fontSize: 12,
        color: '#7a1035',
        opacity: 0.6,
        paddingLeft: 4,
    },

    // ── Social ────────────────────────────────────────────────────────────
    socialContainer: {
        marginBottom: spacing.lg,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        backgroundColor: colors.surface,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: colors.outlineVariant,
    },
    socialIcon: {
        width: 20,
        height: 20,
        marginRight: spacing.sm,
    },
    googleText: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.sm,
        color: colors.onSurface,
    },

    // ── Divider ───────────────────────────────────────────────────────────
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.outlineVariant,
    },
    dividerText: {
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.xs,
        color: colors.onSurfaceVariant,
        paddingHorizontal: spacing.md,
        letterSpacing: 1,
        opacity: 0.6,
    },

    // ── Formulário ────────────────────────────────────────────────────────
    formContainer: {
        gap: spacing.md,
    },
    inputGroup: {
        gap: 6,
    },
    inputLabel: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.sm,
        color: colors.onSurfaceVariant,
        marginLeft: spacing.xs,
    },
    input: {
        height: 56,
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: colors.secondaryContainer,
        borderRadius: radius.full,
        paddingHorizontal: spacing.lg,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.md,
        color: colors.onSurface,
    },
    inputError: {
        borderColor: '#d63b6a',
        backgroundColor: '#fff0f3',
    },
    passwordContainer: {
        position: 'relative',
        justifyContent: 'center',
    },
    passwordInput: {
        height: 56,
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: colors.secondaryContainer,
        borderRadius: radius.full,
        paddingHorizontal: spacing.lg,
        paddingRight: 52,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.md,
        color: colors.onSurface,
    },
    eyeButton: {
        position: 'absolute',
        right: spacing.lg,
        padding: spacing.xs,
    },
    eyeIcon: { fontSize: 16 },
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        paddingRight: spacing.xs,
        marginTop: -spacing.sm,
    },
    forgotPasswordText: {
        fontFamily: typography.fontFamily.medium,
        fontSize: typography.fontSize.xs,
        color: colors.primary,
    },
    loginButton: {
        height: 64,
        backgroundColor: colors.primary,
        borderRadius: radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
        ...shadows.medium,
    },
    loginButtonLoading: {
        opacity: 0.75,
    },
    loginButtonText: {
        fontFamily: typography.fontFamily.headlineBold,
        fontSize: 18,
        color: colors.onPrimary,
    },

    // ── Cadastro / Termos ─────────────────────────────────────────────────
    signUpPrompt: {
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    signUpText: {
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.sm,
        color: colors.onSurfaceVariant,
    },
    signUpLink: {
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primary,
    },
    termsContainer: {
        marginTop: spacing.xxl,
        maxWidth: 280,
        alignItems: 'center',
    },
    termsText: {
        fontFamily: typography.fontFamily.regular,
        fontSize: 11,
        color: colors.onSurfaceVariant,
        textAlign: 'center',
        opacity: 0.6,
        lineHeight: 16,
    },
    termsLink: {
        textDecorationLine: 'underline',
    },
});
