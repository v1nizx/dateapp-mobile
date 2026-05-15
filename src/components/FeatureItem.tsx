import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, fontSize, shadows } from '../styles/theme';

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
        borderRadius: radius.md,
        backgroundColor: colors.tipBackground,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.medium,
        ...shadows.small,
    },
    emoji: {
        fontSize: 28,
    },
    title: {
        fontSize: fontSize.sm,
        fontWeight: '700',
        color: colors.textDark,
        textAlign: 'center',
        marginBottom: 2,
    },
    description: {
        fontSize: fontSize.xs,
        fontWeight: '400',
        color: colors.textMuted,
        textAlign: 'center',
    },
});
