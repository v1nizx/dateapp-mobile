import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, typography, shadows } from '../styles/theme';

interface FeatureItemProps {
    emoji: string;
    title: string;
    description: string;
}

export const FeatureItem: React.FC<FeatureItemProps> = ({
    emoji,
    title,
    description,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Text style={styles.emoji}>{emoji}</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        paddingHorizontal: spacing.sm,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.md,
        backgroundColor: '#FFF0F5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
        ...shadows.small,
    },
    emoji: {
        fontSize: 28,
    },
    title: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 2,
    },
    description: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
