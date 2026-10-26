/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        botanical: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#2E7D32', // Accent green
          800: '#1E5631', // Dark green primary
          900: '#143c22',
          950: '#0c2615',
        },
        primary: {
          DEFAULT: '#1E5631',
          hover: '#184729',
          light: '#2E7D32',
          surface: '#EBF5EE',
        },
        accent: {
          DEFAULT: '#2E7D32',
          hover: '#256629',
          light: '#4CAF50',
        },
        surface: {
          DEFAULT: '#F8FAF9',
          card: '#FFFFFF',
          subtle: '#F1F5F2',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
