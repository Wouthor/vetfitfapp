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
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        magenta: {
          300: '#ff99ff',
          400: '#ff44ff',
          500: '#ff00ff',
          600: '#cc00cc',
          700: '#880088',
          800: '#440044',
          900: '#220022',
          950: '#110011',
        },
        neon: {
          300: '#ffff66',
          400: '#ffff00',
          500: '#cccc00',
          700: '#666600',
          800: '#333300',
          900: '#1a1a00',
          950: '#0d0d00',
        },
        electric: {
          300: '#66ffff',
          400: '#00ffff',
          500: '#00cccc',
          700: '#007777',
          800: '#003333',
          900: '#001919',
          950: '#000d0d',
        },
        void: {
          DEFAULT: '#ff00ff',
          card: '#1a001a',
          input: '#2d002d',
          border: '#660066',
          subtle: '#440044',
        },
      },
    },
  },
  plugins: [],
}

export default config
