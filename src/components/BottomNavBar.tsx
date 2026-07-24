import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, typography, spacing, radius } from '../styles/theme';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

type NavItem = {
    key: 'Home' | 'Planos' | 'Perfil';
    icon: keyof typeof Ionicons.glyphMap;
    iconActive: keyof typeof Ionicons.glyphMap;
    label: string;
};

const NAV_ITEMS: NavItem[] = [
    { key: 'Home',   icon: 'home-outline',     iconActive: 'home',       label: 'Home'   },
    { key: 'Planos', icon: 'sparkles-outline',  iconActive: 'sparkles',   label: 'Planos' },
    { key: 'Perfil', icon: 'person-outline',    iconActive: 'person',     label: 'Perfil' },
];

export function BottomNavBar() {
    const navigation = useNavigation<NavProp>();
    const route = useRoute();
    const currentRoute = route.name;

    return (
        <View style={styles.container}>
            {NAV_ITEMS.map(({ key, icon, iconActive, label }) => {
                const isActive = currentRoute === key;
                return (
                    <TouchableOpacity
                        key={key}
                        style={styles.item}
                        onPress={() => { if (!isActive) navigation.navigate(key as any); }}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
                            <Ionicons
                                name={isActive ? iconActive : icon}
                                size={22}
                                color={isActive ? colors.primary : colors.onSurfaceVariant}
                            />
                        </View>
                        <Text style={[styles.label, isActive && styles.labelActive]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        paddingTop: 10,
        paddingBottom: Platform.OS === 'ios' ? 24 : 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 12,
    },
    item: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrapper: {
        height: 32,
        borderRadius: radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 14,
    },
    iconWrapperActive: {
        backgroundColor: colors.secondaryContainer,
    },
    label: {
        fontFamily: typography.fontFamily.medium,
        fontSize: 10,
        color: colors.onSurfaceVariant,
        marginTop: 2,
        opacity: 0.75,
    },
    labelActive: {
        color: colors.primary,
        fontFamily: typography.fontFamily.semiBold,
        opacity: 1,
    },
});
