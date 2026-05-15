// ─────────────────────────────────────────────────────────────────────────────
// DateApp — Design System
// Fonte: sistema (Helvetica Neue / Roboto)
// ─────────────────────────────────────────────────────────────────────────────

// ── Paleta de Cores ──────────────────────────────────────────────────────────
export const colors = {
    primary: '#E8437A',
    vibrant: '#FF6B9D',
    medium: '#FF9DBD',
    background: '#FFE4EE',
    backgroundEnd: '#FFF5F8',
    card: '#FFFFFF',
    textDark: '#2D1A22',
    textMuted: '#9E6B7E',
    textOnPrimary: '#FFFFFF',
    chipDefault: '#FFFFFF',
    chipSelected: '#FFE4EE',
    chipBorderDefault: '#FF9DBD',
    chipBorderSelected: '#E8437A',
    buttonGradientStart: '#E8437A',
    buttonGradientEnd: '#FF6B9D',
    buttonDisabledStart: '#FFBDD1',
    buttonDisabledEnd: '#FFD6E5',
    tipBackground: '#FFF0F5',
    tipBorder: '#E8437A',
    economic: '#FFE082',
    moderate: '#BBDEFB',
    premium: '#E1BEE7',
    tagBackground: '#FFF0F5',
    tagText: '#E8437A',
};

// ── Tamanhos de Fonte ─────────────────────────────────────────────────────────
export const fontSize = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 21,
    xxl: 26,
    title: 30,
    hero: 36,
};

// ── Espaçamento ──────────────────────────────────────────────────────────────
export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

// ── Bordas arredondadas ───────────────────────────────────────────────────────
export const radius = {
    sm: 8,
    md: 14,
    lg: 18,
    xl: 24,
    full: 9999,
};

// ── Sombras ──────────────────────────────────────────────────────────────────
export const shadows = {
    small: {
        shadowColor: '#E8437A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#E8437A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.13,
        shadowRadius: 10,
        elevation: 5,
    },
    large: {
        shadowColor: '#E8437A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 18,
        elevation: 9,
    },
};

// ── Compat: aliases para não quebrar imports antigos ─────────────────────────
export const typography = {
    fontFamily: { regular: undefined, bold: undefined },
    fontSize,
};
export const borderRadius = radius;
// Mantido para não quebrar imports; fontes são resolvidas pelo sistema
export const fonts = {
    light: undefined,
    regular: undefined,
    semiBold: undefined,
    bold: undefined,
    black: undefined,
};
