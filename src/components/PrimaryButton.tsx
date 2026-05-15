import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, fontSize } from '../styles/theme';

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
            activeOpacity={0.82}
            style={styles.touchable}
        >
            <LinearGradient
                colors={
                    disabled
                        ? [colors.buttonDisabledStart, colors.buttonDisabledEnd]
                        : [colors.buttonGradientStart, colors.buttonGradientEnd]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                <Text style={styles.text}>
                    {emoji ? `${emoji}  ` : ''}{title}
                </Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    touchable: {
        borderRadius: radius.full,
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.32,
        shadowRadius: 10,
        elevation: 6,
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xxl,
        borderRadius: radius.full,
    },
    text: {
        color: colors.textOnPrimary,
        fontSize: fontSize.lg,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});
