import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101828',
        brand: '#635bff',
        midnight: '#0b1020',
      },
      boxShadow: {
        glow: '0 24px 80px rgba(99, 91, 255, 0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
