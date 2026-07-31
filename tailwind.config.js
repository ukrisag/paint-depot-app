/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary - BWT Navy Blue (lighter shades)
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#2196F3',  // Main BWT Blue (lighter than #002B7F)
          600: '#1E88E5',  // Slightly darker
          700: '#1976D2',
          800: '#1565C0',
          900: '#0D47A1',
        },
        // Brand - BWT Dark Blue (original dark blue for accents)
        brand: {
          50: '#e8eaf6',
          100: '#c5cae9',
          200: '#9fa8da',
          300: '#7986cb',
          400: '#5c6bc0',
          500: '#3f51b5',
          600: '#3949ab',
          700: '#303f9f',
          800: '#283593',
          900: '#002B7F',  // Original BWT Navy
        },
        // Secondary - BWT Orange/Gold (lighter shades)
        secondary: {
          50: '#fff8e1',
          100: '#ffecb3',
          200: '#ffe082',
          300: '#ffd54f',
          400: '#ffca28',
          500: '#FFA726',  // Main BWT Orange (lighter)
          600: '#FF9800',
          700: '#FB8C00',
          800: '#F57C00',
          900: '#E65100',
        },
        // Accent - BWT Gold (warmer tones)
        accent: {
          50: '#fffbf0',
          100: '#fff4d9',
          200: '#ffedb3',
          300: '#ffe18c',
          400: '#ffd666',
          500: '#FFB74D',  // BWT Gold
          600: '#FFA726',
          700: '#FF9800',
          800: '#F57C00',
          900: '#E65100',
        },
        // Neutral - Cool Grays (complements hero)
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
    },
  },
  plugins: [],
}
