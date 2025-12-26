/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'off-white': '#fafbfc',
        'neutral-dark': '#0f1117',
        'neutral-50': '#f8f9fa',
        'neutral-100': '#f0f1f3',
        'neutral-200': '#e5e7eb',
        'neutral-300': '#d1d5db',
        'neutral-400': '#9ca3af',
        'neutral-500': '#6b7280',
        'neutral-600': '#4b5563',
        'neutral-700': '#374151',
        'neutral-800': '#1f2937',
        'neutral-900': '#111827',
      },
      backgroundColor: {
        'glass': 'rgba(255, 255, 255, 0.7)',
        'glass-dark': 'rgba(15, 17, 23, 0.05)',
      },
      backdropBlur: {
        'glass': '10px',
      },
      boxShadow: {
        'glass': '0 2px 12px rgba(15, 17, 23, 0.08)',
        'glass-lg': '0 8px 32px rgba(15, 17, 23, 0.12)',
        'glass-xl': '0 16px 48px rgba(15, 17, 23, 0.15)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['15px', { lineHeight: '24px' }],
        'lg': ['17px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
      },
    },
  },
  plugins: [],
};