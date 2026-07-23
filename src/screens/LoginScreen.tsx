import React, { useState } from 'react';
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
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

// Firebase Imports
import { auth } from '../config/firebase';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithCredential
} from 'firebase/auth';

// expo-auth-session (funciona no Expo Go, sem build nativa)
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const navigation = useNavigation<LoginScreenNavigationProp>();

    // expo-auth-session Google provider (funciona no Expo Go)
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });

    // Quando a resposta do Google retornar, autentica no Firebase
    React.useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            setLoading(true);
            signInWithCredential(auth, credential)
                .then(() => navigation.navigate('Home'))
                .catch((error: any) => {
                    console.error('Firebase Google Auth Error:', error);
                    Alert.alert('Erro', 'Falha ao autenticar com o Google.');
                })
                .finally(() => setLoading(false));
        }
    }, [response]);

    const handleEmailAuth = async (isSignUp: boolean) => {
        if (!email || !password) {
            Alert.alert('Atenção', 'Por favor, preencha email e senha.');
            return;
        }

        setLoading(true);
        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
                Alert.alert('Sucesso', 'Conta criada com sucesso!');
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            navigation.navigate('Home');
        } catch (error: any) {
            console.error('Email Auth Error:', error);
            Alert.alert('Erro', error.message || 'Falha na autenticação.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        if (!request) {
            Alert.alert('Aguarde', 'Configurando autenticação...');
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
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoIconContainer}>
                            <Text style={styles.logoIcon}>❤️</Text>
                        </View>
                        <Text style={styles.appTitle}>DateApp ✨</Text>
                        <Text style={styles.appSubtitle}>Encontre a sua próxima noite mágica</Text>
                    </View>

                    {/* Auth Card */}
                    <View style={styles.authCard}>
                        <View style={styles.welcomeHeader}>
                            <Text style={styles.welcomeTitle}>Bem-vindo(a) 💕</Text>
                            <Text style={styles.welcomeSubtitle}>Entre para descobrir novos momentos</Text>
                        </View>

                        {/* Social Login */}
                        <View style={styles.socialContainer}>
                            <TouchableOpacity 
                                style={styles.googleButton}
                                onPress={handleGoogleLogin}
                                disabled={loading}
                            >
                                <Image 
                                    source={{uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpQjZA7Z-9yvle4Obl_BqFaMeTvhvVRM0kBRK9XJwnmfGcAkZwz13FJJ9FFw_105Ou1MSKXtTJa-ldF2JDmSSH7a3uMSvlFBuiFrjH2uP0qFpHdt6ORyc72gmwORKNdZlviQduKCoLKR0_im-QbS4vkrPb_pyvUClrqYzTbDcLDczWpv6Uwv9oQ4871Krl16lUOjm-f5VNzhU8yINTk63BTcgtf9AyDJne163OxPh3mhv1CUw3Vk2Z'}} 
                                    style={styles.socialIcon} 
                                />
                                <Text style={styles.googleText}>Entrar com Google</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.appleButton} disabled={loading}>
                                <Text style={styles.appleIcon}>🍏</Text>
                                <Text style={styles.appleText}>Entrar com Apple</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OU E-MAIL</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Email Form */}
                        <View style={styles.formContainer}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>📧 E-mail</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="seu@email.com"
                                    placeholderTextColor="rgba(27, 28, 28, 0.5)"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    editable={!loading}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>🔒 Senha</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="••••••••"
                                        placeholderTextColor="rgba(27, 28, 28, 0.5)"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                        editable={!loading}
                                    />
                                    <TouchableOpacity 
                                        style={styles.eyeButton}
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.forgotPasswordContainer}>
                                <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.loginButton} 
                                activeOpacity={0.8}
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

                        {/* Sign Up Prompt */}
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

                    {/* Terms */}
                    <View style={styles.termsContainer}>
                        <Text style={styles.termsText}>
                            Ao continuar, você concorda com nossos <Text style={styles.termsLink}>Termos de Serviço</Text> e <Text style={styles.termsLink}>Política de Privacidade</Text>.
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
    logoIcon: {
        fontSize: 40,
    },
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
    socialContainer: {
        gap: spacing.sm,
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
    appleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        backgroundColor: colors.onSurface,
        borderRadius: radius.full,
    },
    appleIcon: {
        fontSize: 20,
        marginRight: spacing.sm,
    },
    appleText: {
        fontFamily: typography.fontFamily.semiBold,
        fontSize: typography.fontSize.sm,
        color: colors.surface,
    },
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
        backgroundColor: '#ffffff', // surface-container-lowest
        borderWidth: 1,
        borderColor: colors.secondaryContainer, // secondary-fixed border
        borderRadius: radius.full,
        paddingHorizontal: spacing.lg,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.md,
        color: colors.onSurface,
    },
    passwordContainer: {
        position: 'relative',
        justifyContent: 'center',
    },
    passwordInput: {
        height: 56,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: colors.secondaryContainer,
        borderRadius: radius.full,
        paddingHorizontal: spacing.lg,
        paddingRight: 50,
        fontFamily: typography.fontFamily.regular,
        fontSize: typography.fontSize.md,
        color: colors.onSurface,
    },
    eyeButton: {
        position: 'absolute',
        right: spacing.lg,
        padding: spacing.xs,
    },
    eyeIcon: {
        fontSize: 16,
    },
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
    loginButtonText: {
        fontFamily: typography.fontFamily.headlineBold,
        fontSize: 18,
        color: colors.onPrimary,
    },
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
