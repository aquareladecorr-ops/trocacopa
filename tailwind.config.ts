import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#009C3B',
          'green-dark': '#007a2e',
          yellow: '#FFDF00',
          'yellow-dark': '#e6c800',
          blue: '#002776',
        },
        ink: { 50: '#f7f8fa', 100: '#eef1f5', 900: '#0d1117' },
      },
      fontFamily: {
        display: ['"Archivo Black"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: { stamp: '4px 4px 0 0 rgba(0,0,0,0.15)' },
    },
  },
  plugins: [],
};
export default config;
