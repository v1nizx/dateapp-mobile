import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, fontSize } from '../styles/theme';

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
            activeOpacity={0.72}
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
        backgroundColor: colors.card,
        borderRadius: radius.full,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderWidth: 1.5,
        borderColor: colors.chipBorderDefault,
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
    },
    selected: {
        borderColor: colors.primary,
        backgroundColor: colors.chipSelected,
        borderWidth: 2,
    },
    emoji: {
        fontSize: 16,
        marginRight: spacing.sm,
    },
    label: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.textMuted,
    },
    labelSelected: {
        color: colors.primary,
        fontWeight: '700',
    },
});
