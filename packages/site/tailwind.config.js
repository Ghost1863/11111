module.exports = {
  darkMode: 'class',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  presets: [require('@medusajs/ui-preset')],
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@medusajs/ui/dist/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        'buttons-accent': 'var(--buttons-accent)',
      },
      fill: {
        dark: '#18181b',
      },
      colors: {
        // кастомные цвета
        dark: '#18181b',
      },
    },
    screens: {
      '2xl': '1280px',
    },
    container: {
      center: true,
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('tailwindcss-radix')(),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('tailwindcss-animate'),
  ],
};
