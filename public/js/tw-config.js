/* Pitch Velocity design tokens — loaded right after the Tailwind Play CDN. */
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'error-container': '#93000a', 'inverse-on-surface': '#2c3137', 'on-tertiary': '#621100',
        'surface': '#0f1419', 'inverse-surface': '#dee3ea', 'surface-variant': '#30353b',
        'on-surface': '#dee3ea', 'on-background': '#dee3ea', 'surface-container': '#1b2025',
        'surface-container-highest': '#30353b', 'inverse-primary': '#006d35', 'error': '#ffb4ab',
        'outline-variant': '#3b4b3d', 'secondary-container': '#00e3fd', 'on-primary': '#003919',
        'surface-bright': '#353a3f', 'on-error': '#690005', 'on-surface-variant': '#b9cbb9',
        'surface-container-high': '#252a30', 'primary-fixed-dim': '#00e476', 'on-primary-container': '#007137',
        'secondary-fixed-dim': '#00daf3', 'surface-container-lowest': '#0a0f14', 'tertiary-container': '#ffd5cb',
        'on-secondary-container': '#00616d', 'primary-fixed': '#61ff97', 'surface-dim': '#0f1419',
        'secondary-fixed': '#9cf0ff', 'on-secondary': '#00363d', 'secondary': '#bdf4ff',
        'tertiary': '#fffaf9', 'primary': '#f0ffee', 'background': '#0f1419', 'outline': '#849584',
        'surface-tint': '#00e476', 'surface-container-low': '#171c21', 'primary-container': '#00ff85',
      },
      borderRadius: { DEFAULT: '0.125rem', lg: '0.25rem', xl: '0.5rem', full: '0.75rem' },
      spacing: { lg: '24px', xs: '4px', gutter: '16px', sm: '8px', md: '16px', unit: '4px', 'margin-desktop': '64px', xl: '48px', 'margin-mobile': '16px' },
      fontFamily: {
        'body-md': ['Hanken Grotesk'], 'headline-lg': ['Anybody'], 'display-lg': ['Anybody'],
        'headline-md': ['Anybody'], 'body-lg': ['Hanken Grotesk'], 'label-match': ['JetBrains Mono'], 'label-data': ['JetBrains Mono'],
      },
      fontSize: {
        'body-md': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'headline-lg': ['40px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-lg': ['72px', { lineHeight: '1.0', letterSpacing: '-0.04em', fontWeight: '900' }],
        'headline-md': ['24px', { lineHeight: '1.2', fontWeight: '700' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'label-match': ['14px', { lineHeight: '1.0', letterSpacing: '0.1em', fontWeight: '600' }],
        'label-data': ['12px', { lineHeight: '1.0', fontWeight: '500' }],
      },
    },
  },
};
