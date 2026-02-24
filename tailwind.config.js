/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f0',
          100: '#dcf0dc',
          200: '#b9e1b9',
          300: '#8fc98f',
          400: '#65b065',
          500: '#1B4D3E',
          600: '#154033',
          700: '#0f3328',
          800: '#09261d',
          900: '#041912',
        },
        accent: {
          lime: '#B1D8B7',
          orange: '#FFA500',
          red: '#FF4F4F',
          cream: '#FFF9F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.03)',
        'hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      }
    },
  },
  plugins: [],
}