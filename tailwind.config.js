/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    // Динамические классы зон (blue/yellow/red/green) для JIT
    'border-blue-300', 'border-red-300', 'border-green-300', 'border-yellow-300',
    'ring-blue-50', 'ring-red-50', 'ring-green-50', 'ring-yellow-50',
    'border-blue-200', 'border-red-200', 'border-green-200', 'border-yellow-200',
  ],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        brand: { 50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e', 600: '#16a34a', 900: '#14532d' },
      },
      keyframes: {
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
      },
      animation: {
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
}