import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';

import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation<RegisterScreenNavigationProp>();

    const formatPhone = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        let formatted = cleaned;
        if (cleaned.length <= 2) {
            formatted = `(${cleaned}`;
        } else if (cleaned.length <= 7) {
            formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
        } else if (cleaned.length <= 11) {
            formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        }
        setPhone(formatted);
    };

    const handleRegister = async () => {
        if (!name.trim()) {
            Alert.alert('Atenção', 'Por favor, informe seu nome.');
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            Alert.alert('Atenção', 'Por favor, informe um e-mail válido.');
            return;
        }
        if (phone.replace(/\D/g, '').length < 10) {
            Alert.alert('Atenção', 'Por favor, informe um número válido.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Senha fraca', 'A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Senhas diferentes', 'A senha e a confirmação não coincidem.');
            return;
        }

        setLoading(true);
        try {
            console.log('[Register] Iniciando criação de conta para:', email.trim());
            console.log('[Register] auth object:', auth);

            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );

            console.log('[Register] Usuário criado:', userCredential.user.uid);

            // Salva o nome de exibição no perfil do Firebase
            await updateProfile(userCredential.user, { displayName: name.trim() });

            console.log('[Register] Perfil atualizado com nome:', name.trim());

            Alert.alert(
                'Cadastro realizado! 🎉',
                `Bem-vindo(a), ${name.trim()}!`,
                [{ text: 'Continuar', onPress: () => navigation.navigate('Home') }]
            );
        } catch (error: any) {
            console.error('[Register] Erro completo:', JSON.stringify(error, null, 2));
            console.error('[Register] Código do erro:', error.code);
            console.error('[Register] Mensagem:', error.message);

            if (error.code === 'auth/email-already-in-use') {
                Alert.alert('E-mail já cadastrado', 'Este e-mail já está em uso. Faça login em vez disso.');
            } else if (error.code === 'auth/invalid-email') {
                Alert.alert('E-mail inválido', 'Por favor, informe um e-mail válido.');
            } else if (error.code === 'auth/network-request-failed') {
                Alert.alert('Sem conexão', 'Verifique sua internet e tente novamente.');
            } else {
                Alert.alert('Erro', `Código: ${error.code}\n${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <LinearGradient colors={['#ffd9e2', '#fbf9f8']} style={styles.gradientBg} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Text style={styles.backIcon}>←</Text>
                        </TouchableOpacity>
                        <View style={styles.logoIconContainer}>
                            <Text style={styles.logoIcon}>💌</Text>
                        </View>
                        <Text style={styles.appTitle}>Criar Conta</Text>
                        <Text style={styles.appSubtitle}>
                            Junte-se a milhares de pessoas que já encontraram seu par ideal ✨
                        </Text>
                    </View>

                    {/* Card do Formulário */}
                    <View style={styles.card}>

                        {/* Campo Nome */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Nome completo</Text>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputIcon}>👤</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Seu nome"
                                    placeholderTextColor={colors.outlineVariant}
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                    returnKeyType="next"
                                />
                            </View>
                        </View>

                        {/* Campo E-mail */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>E-mail</Text>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputIcon}>✉️</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="seu@email.com"
                                    placeholderTextColor={colors.outlineVariant}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    returnKeyType="next"
                                />
                            </View>
                        </View>

                        {/* Campo Telefone */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Número de celular</Text>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputIcon}>📱</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="(00) 00000-0000"
                                    placeholderTextColor={colors.outlineVariant}
                                    value={phone}
                                    onChangeText={formatPhone}
                                    keyboardType="phone-pad"
                                    maxLength={15}
                                    returnKeyType="done"
                                />
                            </View>
                        </View>

                        {/* Campo Senha */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Senha</Text>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputIcon}>🔒</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Mínimo 6 caracteres"
                                    placeholderTextColor={colors.outlineVariant}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    returnKeyType="next"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                                    <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Campo Confirmar Senha */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Confirmar senha</Text>
                            <View style={[styles.inputWrapper, confirmPassword.length > 0 && password !== confirmPassword && styles.inputError]}>
                                <Text style={styles.inputIcon}>🔑</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Repita a senha"
                                    placeholderTextColor={colors.outlineVariant}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirm}
                                    returnKeyType="done"
                                />
                                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeButton}>
                                    <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁️'}</Text>
                                </TouchableOpacity>
                            </View>
                            {confirmPassword.length > 0 && password !== confirmPassword && (
                                <Text style={styles.errorHint}>As senhas não coincidem</Text>
                            )}
                        </View>

                        {/* Botão Cadastrar */}
                        <TouchableOpacity
                            style={[styles.registerButton, loading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={loading
                                    ? [colors.buttonDisabledStart, colors.buttonDisabledEnd]
                                    : [colors.buttonGradientStart, colors.buttonGradientEnd]}
                                style={styles.gradientButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.registerButtonText}>Criar minha conta 💕</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Já tem conta */}
                        <TouchableOpacity
                            style={styles.loginLink}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.loginLinkText}>
                                Já tem uma conta?{' '}
                                <Text style={styles.loginLinkBold}>Entrar</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Terms */}
                    <Text style={styles.terms}>
                        Ao criar uma conta, você concorda com nossos{' '}
                        <Text style={styles.termsLink}>Termos de Uso</Text>
                        {' '}e{' '}
                        <Text style={styles.termsLink}>Política de Privacidade</Text>.
                    </Text>

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
        ...StyleSheet.absoluteFillObject,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: spacing.lg,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
        marginTop: spacing.md,
    },
    backButton: {
        alignSelf: 'flex-start',
        padding: spacing.sm,
        marginBottom: spacing.md,
    },
    backIcon: {
        fontSize: 24,
        color: colors.primary,
    },
    logoIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.primaryContainer + '33',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        ...shadows.small,
    },
    logoIcon: {
        fontSize: 36,
    },
    appTitle: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.headlineBold,
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    appSubtitle: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: spacing.md,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: radius.xl,
        padding: spacing.lg,
        ...shadows.medium,
        marginBottom: spacing.lg,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    inputLabel: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.textDark,
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.outlineVariant,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.surface,
    },
    inputIcon: {
        fontSize: 18,
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: typography.fontSize.md,
        fontFamily: typography.fontFamily.regular,
        color: colors.textDark,
        padding: 0,
    },
    registerButton: {
        borderRadius: radius.full,
        marginTop: spacing.md,
        marginBottom: spacing.md,
        overflow: 'hidden',
        ...shadows.small,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    gradientButton: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    registerButtonText: {
        fontSize: typography.fontSize.md,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.textOnPrimary,
        letterSpacing: 0.5,
    },
    loginLink: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    loginLinkText: {
        fontSize: typography.fontSize.sm,
        fontFamily: typography.fontFamily.regular,
        color: colors.textMuted,
    },
    loginLinkBold: {
        fontFamily: typography.fontFamily.semiBold,
        color: colors.primary,
    },
    terms: {
        fontSize: 12,
        fontFamily: typography.fontFamily.regular,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 18,
    },
    eyeButton: {
        padding: 4,
    },
    eyeIcon: {
        fontSize: 18,
    },
    inputError: {
        borderColor: colors.error,
    },
    errorHint: {
        fontSize: 12,
        color: colors.error,
        marginTop: 4,
        fontFamily: typography.fontFamily.regular,
    },
    termsLink: {
        color: colors.primary,
        fontFamily: typography.fontFamily.semiBold,
    },
});
