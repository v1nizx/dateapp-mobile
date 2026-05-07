import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../styles/theme';

interface FacilityChipProps {
    emoji: string;
    label: string;
    selected?: boolean;
    onPress: () => void;
}

export const FacilityChip: React.FC<FacilityChipProps> = ({
    emoji,
    label,
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
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: borderRadius.full,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
    },
    selected: {
        borderColor: colors.primary,
        backgroundColor: '#FFF5F8',
    },
    emoji: {
        fontSize: 16,
        marginRight: spacing.sm,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    labelSelected: {
        color: colors.primary,
    },
});
