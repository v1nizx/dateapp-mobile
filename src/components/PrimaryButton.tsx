import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing, typography } from '../styles/theme';

interface PrimaryButtonProps {
    title: string;
    emoji?: string;
    onPress: () => void;
    disabled?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    title,
    emoji,
    onPress,
    disabled = false,
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
            style={styles.touchable}
        >
            <LinearGradient
                colors={disabled ? ['#ccc', '#aaa'] : ['#FF6B9D', '#FF8EB3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                {emoji && <Text style={styles.emoji}>{emoji}</Text>}
                <Text style={styles.text}>{title}</Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    touchable: {
        borderRadius: borderRadius.full,
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xxl,
        borderRadius: borderRadius.full,
    },
    emoji: {
        fontSize: 18,
        marginRight: spacing.sm,
    },
    text: {
        color: '#FFFFFF',
        fontSize: typography.fontSize.lg,
        fontWeight: '700',
    },
});
