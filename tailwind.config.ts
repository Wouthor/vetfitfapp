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
        // Roze/magenta: licht roze-grijs papier, diep aubergine als inkt, magenta als merkkleur
        paper: '#f7f1f3',
        surface: '#fffafc',
        sunken: '#f0e5ea',
        line: '#e0cdd6',
        ink: { DEFAULT: '#2a0b22', soft: '#4d1b40' },
        brand: { DEFAULT: '#d4006f', dark: '#a8005a' },
        muted: '#7d5a6d',
        faint: '#a98c9b',
        rose: '#f39ac8',     // lichtroze: labels op donker, sectienummers
        blush: '#fde2ef',    // zachtroze vlakken: actieve keuzes, "gedaan"
        berry: '#a3125f',    // donker magenta tekst op blush
        gold: '#a8741a',
        // Oude namen gemapt op het nieuwe palet, zodat bestaande classes meegaan
        neon: {
          300: '#4d1b40', 400: '#2a0b22', 500: '#1a0615',
          700: '#f39ac8', 800: '#f8c4dd', 900: '#fde2ef', 950: '#fef0f6',
        },
        electric: {
          300: '#a3125f', 400: '#a3125f', 500: '#d4006f',
          700: '#f39ac8', 800: '#f8c4dd', 900: '#fde2ef', 950: '#fef0f6',
        },
        magenta: {
          300: '#7d5a6d', 400: '#2a0b22', 500: '#2a0b22', 600: '#e0cdd6',
          700: '#2a0b22', 800: '#f8c4dd', 900: '#fde2ef', 950: '#fef0f6',
        },
        void: {
          DEFAULT: '#f7f1f3',
          card: '#fffafc',
          input: '#f0e5ea',
          border: '#e0cdd6',
          subtle: '#f0e5ea',
        },
      },
    },
  },
  plugins: [],
}

export default config
