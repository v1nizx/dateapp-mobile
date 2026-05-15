import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, fontSize, shadows } from '../styles/theme';

interface SectionCardProps {
    title?: string;
    subtitle?: string;
    children: ReactNode;
    sparkles?: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({
    title,
    subtitle,
    children,
    sparkles = false,
}) => {
    return (
        <View style={styles.container}>
            {title && (
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {sparkles && '✨ '}
                        {title}
                        {sparkles && ' ✨'}
                    </Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
            )}
            <View style={styles.content}>{children}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.card,
        borderRadius: radius.xl,
        padding: spacing.xl,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        ...shadows.medium,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        color: colors.primary,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: fontSize.sm,
        fontWeight: '400',
        color: colors.textMuted,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    content: {
        width: '100%',
    },
});
