import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BottomNavBar } from '../components/BottomNavBar';
import { colors, spacing, radius, fontSize, fonts, shadows } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { updateProfile, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

// ─── Tipos ────────────────────────────────────────────────────────────────────
type BudgetPref = 'economic' | 'moderate' | 'premium';
type ExperiencePref = 'gastronomy' | 'culture' | 'nature' | 'adventure' | 'casual';
type TimePref = 'day' | 'night' | 'both';

interface LocalPrefs {
    partnerName: string;
    phone: string;
    budgetPrefs: BudgetPref[];
    experiencePrefs: ExperiencePref[];
    timePrefs: TimePref[];
    notifications: boolean;
}

const DEFAULT_PREFS: LocalPrefs = {
    partnerName: '',
    phone: '',
    budgetPrefs: ['moderate'],
    experiencePrefs: ['gastronomy'],
    timePrefs: ['both'],
    notifications: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toggleInArray<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
}

function formatPhone(text: string): string {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11)
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

function getInitials(name: string): string {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────
interface PrefChipProps {
    emoji: string;
    label: string;
    selected: boolean;
    onPress: () => void;
}
const PrefChip: React.FC<PrefChipProps> = ({ emoji, label, selected, onPress }) => (
    <TouchableOpacity
        style={[styles.prefChip, selected && styles.prefChipSelected]}
        onPress={onPress}
        activeOpacity={0.72}
    >
        <Text style={styles.prefChipEmoji}>{emoji}</Text>
        <Text style={[styles.prefChipLabel, selected && styles.prefChipLabelSelected]}>
            {label}
        </Text>
    </TouchableOpacity>
);

interface InputFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (t: string) => void;
    keyboardType?: 'default' | 'phone-pad' | 'email-address';
    icon: keyof typeof Ionicons.glyphMap;
    editable?: boolean;
}
const InputField: React.FC<InputFieldProps> = ({
    label, placeholder, value, onChangeText,
    keyboardType = 'default', icon, editable = true,
}) => {
    const [focused, setFocused] = useState(false);
    return (
        <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={[
                styles.inputContainer,
                focused && styles.inputContainerFocused,
                !editable && styles.inputContainerDisabled,
            ]}>
                <Ionicons
                    name={icon}
                    size={18}
                    color={focused ? colors.primary : colors.onSurfaceVariant}
                    style={styles.inputIcon}
                />
                <TextInput
                    style={styles.textInput}
                    placeholder={placeholder}
                    placeholderTextColor={colors.outline}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    autoCapitalize={keyboardType === 'default' ? 'words' : 'none'}
                    editable={editable}
                />
                {value.length > 0 && editable && (
                    <TouchableOpacity
                        onPress={() => onChangeText('')}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons name="close-circle" size={16} color={colors.outline} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

// ─── Tela principal ───────────────────────────────────────────────────────────
export const PerfilScreen: React.FC = () => {
    const { user, loadingAuth } = useAuth();
    const navigation = useNavigation<NavProp>();

    // Nome editável (sync com Firebase displayName)
    const [displayName, setDisplayName] = useState(user?.displayName ?? '');
    const [prefs, setPrefs] = useState<LocalPrefs>(DEFAULT_PREFS);
    const [saving, setSaving] = useState(false);

    // Sincroniza quando o user do contexto carrega/muda
    useEffect(() => {
        if (user?.displayName) {
            setDisplayName(user.displayName);
        }
    }, [user?.displayName]);

    const handleSave = async () => {
        if (!displayName.trim()) {
            Alert.alert('Atenção', 'Por favor, insira seu nome 💕');
            return;
        }
        setSaving(true);
        try {
            // Atualiza displayName no Firebase Auth
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, {
                    displayName: displayName.trim(),
                });
            }
            Alert.alert('Salvo!', 'Suas preferências foram atualizadas com sucesso ✨');
        } catch (e) {
            Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sair da conta',
            'Tem certeza que deseja sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut(auth);
                        navigation.navigate('Login');
                    },
                },
            ]
        );
    };

    const toggleBudget = (b: BudgetPref) =>
        setPrefs(p => ({ ...p, budgetPrefs: toggleInArray(p.budgetPrefs, b) }));
    const toggleExperience = (e: ExperiencePref) =>
        setPrefs(p => ({ ...p, experiencePrefs: toggleInArray(p.experiencePrefs, e) }));
    const toggleTime = (t: TimePref) =>
        setPrefs(p => ({ ...p, timePrefs: toggleInArray(p.timePrefs, t) }));

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loadingAuth) {
        return (
            <SafeAreaView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    // ── Avatar (iniciais ou emoji) ────────────────────────────────────────────
    const initials = displayName ? getInitials(displayName) : null;
    const avatarContent = initials ?? '💕';
    const isTextAvatar = !!initials;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            <LinearGradient
                colors={[colors.background, colors.backgroundEnd, colors.card]}
                style={styles.gradient}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* ── Header / Avatar ── */}
                        <View style={styles.header}>
                            <View style={styles.avatarCircle}>
                                <Text style={isTextAvatar ? styles.avatarInitials : styles.avatarEmoji}>
                                    {avatarContent}
                                </Text>
                            </View>
                            <Text style={styles.headerTitle}>
                                {displayName.trim() || 'Seu Perfil'}
                            </Text>
                            {user?.email ? (
                                <Text style={styles.headerEmail}>{user.email}</Text>
                            ) : null}
                            <Text style={styles.headerSub}>Personalize sua experiência romântica</Text>
                        </View>

                        {/* ── Card: Dados pessoais ── */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
                                <Text style={styles.cardTitle}>Dados pessoais</Text>
                            </View>

                            <InputField
                                label="Seu nome"
                                placeholder="Como você se chama?"
                                value={displayName}
                                onChangeText={setDisplayName}
                                icon="person-outline"
                            />

                            {/* E-mail (somente leitura — vem do Firebase) */}
                            <InputField
                                label="E-mail"
                                placeholder="—"
                                value={user?.email ?? ''}
                                onChangeText={() => {}}
                                keyboardType="email-address"
                                icon="mail-outline"
                                editable={false}
                            />

                            <InputField
                                label="Nome do(a) parceiro(a)"
                                placeholder="Nome de quem você ama 💕"
                                value={prefs.partnerName}
                                onChangeText={t => setPrefs(p => ({ ...p, partnerName: t }))}
                                icon="heart-outline"
                            />

                            <InputField
                                label="WhatsApp"
                                placeholder="(98) 99999-9999"
                                value={prefs.phone}
                                onChangeText={t => setPrefs(p => ({ ...p, phone: formatPhone(t) }))}
                                keyboardType="phone-pad"
                                icon="call-outline"
                            />
                        </View>

                        {/* ── Card: Orçamento ── */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="wallet-outline" size={20} color={colors.primary} />
                                <Text style={styles.cardTitle}>Orçamento preferido</Text>
                            </View>
                            <Text style={styles.cardSubtitle}>
                                Selecione um ou mais — usaremos como padrão nos filtros
                            </Text>
                            <View style={styles.prefRow}>
                                <PrefChip emoji="👛" label="Econômico"
                                    selected={prefs.budgetPrefs.includes('economic')}
                                    onPress={() => toggleBudget('economic')} />
                                <PrefChip emoji="💎" label="Moderado"
                                    selected={prefs.budgetPrefs.includes('moderate')}
                                    onPress={() => toggleBudget('moderate')} />
                                <PrefChip emoji="👑" label="Premium"
                                    selected={prefs.budgetPrefs.includes('premium')}
                                    onPress={() => toggleBudget('premium')} />
                            </View>
                        </View>

                        {/* ── Card: Experiências ── */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="compass-outline" size={20} color={colors.primary} />
                                <Text style={styles.cardTitle}>Tipos de experiência</Text>
                            </View>
                            <Text style={styles.cardSubtitle}>O que vocês mais curtem fazer juntos?</Text>
                            <View style={styles.prefGrid}>
                                <View style={styles.prefRow}>
                                    <PrefChip emoji="🍽️" label="Gastronomia"
                                        selected={prefs.experiencePrefs.includes('gastronomy')}
                                        onPress={() => toggleExperience('gastronomy')} />
                                    <PrefChip emoji="🎭" label="Cultura"
                                        selected={prefs.experiencePrefs.includes('culture')}
                                        onPress={() => toggleExperience('culture')} />
                                    <PrefChip emoji="🌿" label="Natureza"
                                        selected={prefs.experiencePrefs.includes('nature')}
                                        onPress={() => toggleExperience('nature')} />
                                </View>
                                <View style={[styles.prefRow, styles.prefRowCentered]}>
                                    <PrefChip emoji="⚡" label="Aventura"
                                        selected={prefs.experiencePrefs.includes('adventure')}
                                        onPress={() => toggleExperience('adventure')} />
                                    <PrefChip emoji="🧸" label="Casual"
                                        selected={prefs.experiencePrefs.includes('casual')}
                                        onPress={() => toggleExperience('casual')} />
                                </View>
                            </View>
                        </View>

                        {/* ── Card: Período ── */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="time-outline" size={20} color={colors.primary} />
                                <Text style={styles.cardTitle}>Período preferido</Text>
                            </View>
                            <Text style={styles.cardSubtitle}>Quando vocês costumam sair?</Text>
                            <View style={styles.prefRow}>
                                <PrefChip emoji="☀️" label="Dia"
                                    selected={prefs.timePrefs.includes('day')}
                                    onPress={() => toggleTime('day')} />
                                <PrefChip emoji="🌙" label="Noite"
                                    selected={prefs.timePrefs.includes('night')}
                                    onPress={() => toggleTime('night')} />
                                <PrefChip emoji="✨" label="Qualquer"
                                    selected={prefs.timePrefs.includes('both')}
                                    onPress={() => toggleTime('both')} />
                            </View>
                        </View>

                        {/* ── Card: Notificações ── */}
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="notifications-outline" size={20} color={colors.primary} />
                                <Text style={styles.cardTitle}>Notificações</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.toggleRow}
                                onPress={() => setPrefs(p => ({ ...p, notifications: !p.notifications }))}
                                activeOpacity={0.8}
                            >
                                <View style={styles.toggleInfo}>
                                    <Text style={styles.toggleLabel}>Dicas e sugestões românticas</Text>
                                    <Text style={styles.toggleSub}>Receba inspirações para novos dates</Text>
                                </View>
                                <View style={[styles.toggle, prefs.notifications && styles.toggleOn]}>
                                    <View style={[styles.toggleThumb, prefs.notifications && styles.toggleThumbOn]} />
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* ── Botão Salvar ── */}
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            activeOpacity={0.85}
                            disabled={saving}
                        >
                            <LinearGradient
                                colors={[colors.primary, colors.primaryContainer]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.saveButtonGradient}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                                        <Text style={styles.saveButtonText}>Salvar preferências</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* ── Botão Sair ── */}
                        <TouchableOpacity
                            style={styles.signOutButton}
                            onPress={handleSignOut}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="log-out-outline" size={18} color={colors.error} />
                            <Text style={styles.signOutText}>Sair da conta</Text>
                        </TouchableOpacity>

                        {/* ── Footer ── */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>💕 DateApp · Criando memórias inesquecíveis</Text>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>

            <BottomNavBar />
        </SafeAreaView>
    );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { alignItems: 'center', justifyContent: 'center' },
    gradient: { flex: 1 },
    scrollContent: { paddingBottom: 90 },

    // ── Header ──────────────────────────────────────────────────────────────
    header: {
        alignItems: 'center',
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    avatarCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: colors.secondaryContainer,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        borderWidth: 3,
        borderColor: colors.primary + '33',
        ...shadows.medium,
    },
    avatarEmoji: { fontSize: 38 },
    avatarInitials: {
        fontSize: 30,
        fontFamily: fonts.headlineExtraBold,
        color: colors.primary,
    },
    headerTitle: {
        fontSize: fontSize.xl,
        fontFamily: fonts.headlineExtraBold,
        color: colors.textDark,
        marginBottom: 2,
    },
    headerEmail: {
        fontSize: fontSize.sm,
        fontFamily: fonts.regular,
        color: colors.textMuted,
        marginBottom: 4,
    },
    headerSub: {
        fontSize: fontSize.sm,
        fontFamily: fonts.regular,
        color: colors.textMuted,
    },

    // ── Card ─────────────────────────────────────────────────────────────────
    card: {
        backgroundColor: colors.card,
        borderRadius: radius.xl,
        padding: spacing.lg,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.outlineVariant,
        ...shadows.small,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },
    cardTitle: {
        fontSize: fontSize.md,
        fontFamily: fonts.headlineBold,
        color: colors.textDark,
    },
    cardSubtitle: {
        fontSize: fontSize.xs,
        fontFamily: fonts.regular,
        color: colors.textMuted,
        marginBottom: spacing.md,
        lineHeight: 18,
    },

    // ── Campos ────────────────────────────────────────────────────────────
    fieldWrapper: { marginBottom: spacing.md },
    fieldLabel: {
        fontSize: fontSize.xs,
        fontFamily: fonts.semiBold,
        color: colors.textMuted,
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: radius.lg,
        borderWidth: 1.5,
        borderColor: colors.outlineVariant,
        paddingHorizontal: spacing.md,
        height: 48,
    },
    inputContainerFocused: {
        borderColor: colors.primary,
        backgroundColor: colors.secondaryContainer + '55',
    },
    inputContainerDisabled: {
        backgroundColor: colors.tipBackground,
        borderColor: colors.outlineVariant,
        opacity: 0.7,
    },
    inputIcon: { marginRight: spacing.xs },
    textInput: {
        flex: 1,
        fontSize: fontSize.sm,
        fontFamily: fonts.regular,
        color: colors.textDark,
        paddingVertical: 0,
    },

    // ── Chips ─────────────────────────────────────────────────────────────
    prefGrid: { gap: spacing.sm },
    prefRow: { flexDirection: 'row', gap: spacing.xs },
    prefRowCentered: { justifyContent: 'center' },
    prefChip: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        borderRadius: radius.lg,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xs,
        borderWidth: 1.5,
        borderColor: colors.outlineVariant,
        minWidth: 70,
    },
    prefChipSelected: {
        backgroundColor: colors.chipSelected,
        borderColor: colors.primary,
        borderWidth: 2,
    },
    prefChipEmoji: { fontSize: 22, marginBottom: 4 },
    prefChipLabel: {
        fontSize: 11,
        fontFamily: fonts.semiBold,
        color: colors.textMuted,
        textAlign: 'center',
    },
    prefChipLabelSelected: { color: colors.primary },

    // ── Toggle ────────────────────────────────────────────────────────────
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    toggleInfo: { flex: 1, marginRight: spacing.md },
    toggleLabel: {
        fontSize: fontSize.sm,
        fontFamily: fonts.semiBold,
        color: colors.textDark,
    },
    toggleSub: {
        fontSize: fontSize.xs,
        fontFamily: fonts.regular,
        color: colors.textMuted,
        marginTop: 2,
    },
    toggle: {
        width: 46,
        height: 26,
        borderRadius: 13,
        backgroundColor: colors.outlineVariant,
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    toggleOn: { backgroundColor: colors.primary },
    toggleThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        ...shadows.small,
    },
    toggleThumbOn: { alignSelf: 'flex-end' },

    // ── Salvar ────────────────────────────────────────────────────────────
    saveButton: {
        marginHorizontal: spacing.lg,
        marginTop: spacing.sm,
        marginBottom: spacing.md,
        borderRadius: radius.full,
        overflow: 'hidden',
        ...shadows.medium,
    },
    saveButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.md + 2,
        minHeight: 52,
    },
    saveButtonText: {
        fontSize: fontSize.md,
        fontFamily: fonts.headlineBold,
        color: '#fff',
    },

    // ── Sair ──────────────────────────────────────────────────────────────
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: radius.full,
        borderWidth: 1.5,
        borderColor: colors.error + '44',
    },
    signOutText: {
        fontSize: fontSize.sm,
        fontFamily: fonts.semiBold,
        color: colors.error,
    },

    // ── Footer ───────────────────────────────────────────────────────────
    footer: { alignItems: 'center', paddingBottom: spacing.md },
    footerText: {
        fontSize: fontSize.xs,
        fontFamily: fonts.regular,
        color: colors.textMuted,
    },
});
