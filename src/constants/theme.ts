export const colors = {
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceLight: '#F5F3EF',
  primary: '#C9A84C',
  secondary: '#7A9E87',
  text: {
    primary: '#F5F3EF',
    secondary: '#A0A0A0',
    inverse: '#0D0D0D',
  },
  border: '#2A2A2A',
  error: '#E05A5A',
  success: '#7A9E87',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  label: { fontSize: 13, fontWeight: '500' as const },
} as const;
