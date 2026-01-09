import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../styles/theme';

interface ChipButtonProps {
    emoji: string;
    label: string;
    sublabel?: string;
    selected?: boolean;
    onPress: () => void;
}

export const ChipButton: React.FC<ChipButtonProps> = ({
    emoji,
    label,
    sublabel,
    selected = false,
    onPress,
}) => {
    return (
        <TouchableOpacity
            style={[styles.container, selected && styles.selected]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
            {sublabel && (
                <Text style={[styles.sublabel, selected && styles.sublabelSelected]}>
                    {sublabel}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        minWidth: 90,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    selected: {
        borderColor: colors.primary,
        backgroundColor: '#FFF5F8',
    },
    emoji: {
        fontSize: 28,
        marginBottom: spacing.xs,
    },
    label: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    labelSelected: {
        color: colors.primary,
    },
    sublabel: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        marginTop: 2,
    },
    sublabelSelected: {
        color: colors.primary,
    },
});
