// ─────────────────────────────────────────────────────────────────────────────
// DateApp — Design System (Smart AI Date Finder)
// ─────────────────────────────────────────────────────────────────────────────

export const colors = {
    primary: '#b90760',
    onPrimary: '#ffffff',
    primaryContainer: '#ff4d94',
    onPrimaryContainer: '#5b002c',
    secondary: '#6b5963',
    secondaryContainer: '#f5dce8',
    onSecondaryContainer: '#725f69',
    tertiary: '#636037',
    tertiaryContainer: '#b1ad7d',
    background: '#fbf9f8',
    onBackground: '#1b1c1c',
    surface: '#fbf9f8',
    onSurface: '#1b1c1c',
    onSurfaceVariant: '#594047',
    outline: '#8c7077',
    outlineVariant: '#e0bec6',
    error: '#ba1a1a',
    
    // Legacy maps for smooth migration
    vibrant: '#ff4d94',
    medium: '#ffb1c7',
    backgroundEnd: '#fbf9f8',
    card: '#ffffff',
    textDark: '#1b1c1c',
    textMuted: '#594047',
    textOnPrimary: '#ffffff',
    chipDefault: '#ffffff',
    chipSelected: '#f5dce8',
    chipBorderDefault: '#e0bec6',
    chipBorderSelected: '#b90760',
    buttonGradientStart: '#b90760',
    buttonGradientEnd: '#ff4d94',
    buttonDisabledStart: '#e4e2e2',
    buttonDisabledEnd: '#e4e2e2',
    tipBackground: '#f5f3f3',
    tipBorder: '#8c7077',
    economic: '#eae4b1',
    moderate: '#f5dce8',
    premium: '#ffd9e2',
    tagBackground: '#f5f3f3',
    tagText: '#b90760',
};

export const fontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 22,
    xl: 28,
    xxl: 32,
    title: 28,
    hero: 32,
};

export const spacing = {
    xs: 8,
    sm: 12,
    md: 16, // card-padding
    lg: 24, // container-padding
    xl: 32, // stack-gap-lg
    xxl: 40, // section-margin
    xxxl: 48,
};

export const radius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

export const shadows = {
    small: {
        shadowColor: '#b90760',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#b90760',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    large: {
        shadowColor: '#b90760',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 50,
        elevation: 8,
    },
};

export const typography = {
    fontFamily: {
        regular: 'BeVietnamPro_400Regular',
        medium: 'BeVietnamPro_500Medium',
        semiBold: 'BeVietnamPro_600SemiBold',
        bold: 'PlusJakartaSans_700Bold',
        headlineBold: 'PlusJakartaSans_700Bold',
        headlineExtraBold: 'PlusJakartaSans_800ExtraBold',
    },
    fontSize,
};

export const borderRadius = radius;

export const fonts = typography.fontFamily;
