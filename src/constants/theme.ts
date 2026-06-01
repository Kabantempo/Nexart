export const colors = {
  background:   '#0f172a',   // --background dark
  surface:      '#1e293b',   // --card dark
  surfaceLight: '#F5F3EF',

  primary:   '#818cf8',      // --primary dark  (indigo-400)
  secondary: '#6366f1',      // indigo-500

  text: {
    primary:   '#e2e8f0',    // --foreground dark
    secondary: '#9ca3af',    // --muted-foreground dark
    inverse:   '#0f172a',    // --primary-foreground dark
  },

  border:  '#4b5563',        // --border dark
  error:   '#ef4444',        // --destructive
  success: '#10b981',        // kept for success states
} as const;

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

export const radius = {
  sm:   6,
  md:   12,
  lg:   20,
  xl:   28,
  full: 999,
} as const;

export const typography = {
  h1:      { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2:      { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3:      { fontSize: 18, fontWeight: '600' as const },
  body:    { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  label:   { fontSize: 13, fontWeight: '500' as const },
} as const;
