/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'Cambria', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        // Warm parchment / ink identity (Communion base)
        ink: '#2a241c',
        'ink-soft': '#6a6153',
        ivory: '#fbf7f0',
        'ivory-2': '#f4ecdf',
        gold: '#c29a4e',
        line: '#e7ddca',
        // Sanctuary (the one dark, reverent moment)
        stone: '#141210',
        'stone-2': '#1c1915',
        'stone-ivory': '#ece4d4',
        'stone-soft': '#a89e8a',
      },
    },
  },
  plugins: [],
}
