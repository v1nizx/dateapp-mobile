import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, fontSize, shadows } from '../styles/theme';

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
            activeOpacity={0.72}
        >
            <Text style={styles.emoji}>{emoji}</Text>
            <Text
                style={[styles.label, selected && styles.labelSelected]}
                numberOfLines={2}
                textBreakStrategy="simple"
            >
                {label}
            </Text>
            {sublabel && (
                <Text
                    style={[styles.sublabel, selected && styles.sublabelSelected]}
                    numberOfLines={1}
                >
                    {sublabel}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.chipDefault,
        borderRadius: radius.lg,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        minWidth: 80,
        borderWidth: 1.5,
        borderColor: colors.chipBorderDefault,
        ...shadows.small,
    },
    selected: {
        borderColor: colors.chipBorderSelected,
        backgroundColor: colors.chipSelected,
        borderWidth: 2,
    },
    emoji: {
        fontSize: 24,
        marginBottom: spacing.xs,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 16,
    },
    labelSelected: {
        color: colors.primary,
        fontWeight: '700',
    },
    sublabel: {
        fontSize: fontSize.xs,
        fontWeight: '400',
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: 2,
    },
    sublabelSelected: {
        color: colors.primary,
    },
});
