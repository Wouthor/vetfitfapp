import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        label: ['var(--font-label)', 'Arial Narrow', 'sans-serif'],
      },
      borderRadius: {
        sm: '3px',
      },
      colors: {
        // Clubkleuren: gebroken wit papier, diep donkergroen, salie als tweede tint
        paper: '#f3f1ec',
        surface: '#fbfaf6',
        sunken: '#ece9e1',
        line: '#d3cfc4',
        ink: { DEFAULT: '#12261e', soft: '#2c4a3d' },
        muted: '#5d7268',
        faint: '#8a9a92',
        sage: '#9fb8aa',
        mint: '#dfe8e1',
        moss: '#2f6b4f',
        gold: '#a8741a',
        // Oude namen gemapt op het nieuwe palet, zodat bestaande classes meegaan
        neon: {
          300: '#2c4a3d', 400: '#12261e', 500: '#0a1712',
          700: '#9fb8aa', 800: '#cfdcd3', 900: '#dfe8e1', 950: '#ebf1ec',
        },
        electric: {
          300: '#2f6b4f', 400: '#2f6b4f', 500: '#3d7a5c',
          700: '#9fb8aa', 800: '#cfdcd3', 900: '#dfe8e1', 950: '#ebf1ec',
        },
        magenta: {
          300: '#5d7268', 400: '#12261e', 500: '#12261e', 600: '#d3cfc4',
          700: '#12261e', 800: '#cfdcd3', 900: '#dfe8e1', 950: '#ebf1ec',
        },
        void: {
          DEFAULT: '#f3f1ec',
          card: '#fbfaf6',
          input: '#ece9e1',
          border: '#d3cfc4',
          subtle: '#e9e6de',
        },
      },
    },
  },
  plugins: [],
}

export default config
