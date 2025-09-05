/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Material Design 3 System Colors
        'md-sys-color-primary': 'var(--md-sys-color-primary)',
        'md-sys-color-on-primary': 'var(--md-sys-color-on-primary)',
        'md-sys-color-primary-container': 'var(--md-sys-color-primary-container)',
        'md-sys-color-on-primary-container': 'var(--md-sys-color-on-primary-container)',
        'md-sys-color-secondary': 'var(--md-sys-color-secondary)',
        'md-sys-color-on-secondary': 'var(--md-sys-color-on-secondary)',
        'md-sys-color-secondary-container': 'var(--md-sys-color-secondary-container)',
        'md-sys-color-on-secondary-container': 'var(--md-sys-color-on-secondary-container)',
        'md-sys-color-surface': 'var(--md-sys-color-surface)',
        'md-sys-color-on-surface': 'var(--md-sys-color-on-surface)',
        'md-sys-color-surface-variant': 'var(--md-sys-color-surface-variant)',
        'md-sys-color-on-surface-variant': 'var(--md-sys-color-on-surface-variant)',
        'md-sys-color-background': 'var(--md-sys-color-background)',
        'md-sys-color-on-background': 'var(--md-sys-color-on-background)',
        'md-sys-color-outline': 'var(--md-sys-color-outline)',
        'md-sys-color-outline-variant': 'var(--md-sys-color-outline-variant)',
        'md-sys-color-error': 'var(--md-sys-color-error)',
        'md-sys-color-on-error': 'var(--md-sys-color-on-error)',
        'md-sys-color-error-container': 'var(--md-sys-color-error-container)',
        'md-sys-color-on-error-container': 'var(--md-sys-color-on-error-container)',
        
        // Legacy colors for backward compatibility
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        surface: 'var(--card)',
        text: 'var(--foreground)',
        subtle: 'var(--muted-foreground)',
      },
      borderRadius: {
        'md-none': 'var(--md-sys-shape-corner-none)',
        'md-xs': 'var(--md-sys-shape-corner-extra-small)',
        'md-sm': 'var(--md-sys-shape-corner-small)',
        'md-md': 'var(--md-sys-shape-corner-medium)',
        'md-lg': 'var(--md-sys-shape-corner-large)',
        'md-xl': 'var(--md-sys-shape-corner-extra-large)',
        DEFAULT: 'var(--radius)',
        lg: 'calc(var(--radius) + 4px)',
        md: 'var(--radius)',
        sm: 'calc(var(--radius) - 2px)',
      },
      boxShadow: {
        'md-elevation-0': 'var(--md-sys-elevation-level0)',
        'md-elevation-1': 'var(--md-sys-elevation-level1)',
        'md-elevation-2': 'var(--md-sys-elevation-level2)',
        'md-elevation-3': 'var(--md-sys-elevation-level3)',
        'md-elevation-4': 'var(--md-sys-elevation-level4)',
        'md-elevation-5': 'var(--md-sys-elevation-level5)',
      },
      fontFamily: {
        'md-display': 'var(--md-sys-typescale-display-large-font)',
        'md-headline': 'var(--md-sys-typescale-headline-large-font)',
        'md-title': 'var(--md-sys-typescale-title-large-font)',
        'md-body': 'var(--md-sys-typescale-body-large-font)',
        'md-label': 'var(--md-sys-typescale-label-large-font)',
        sans: ['Roboto', 'sans-serif'],
      },
      transitionDuration: {
        'md-short2': 'var(--md-sys-motion-duration-short2)',
        'md-short4': 'var(--md-sys-motion-duration-short4)',
        'md-medium2': 'var(--md-sys-motion-duration-medium2)',
      },
      transitionTimingFunction: {
        'md-standard': 'var(--md-sys-motion-easing-standard)',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px', 
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
      },
      opacity: {
        '38': '0.38',
      },
    },
  },
  plugins: [],
}
