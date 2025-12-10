/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,astro}'],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        'royal-blue': '#1d4ed8',
        lime: '#a3ff3f',
        
        // Dark Mode Palette
        dark: '#020617',
        'dark-gray': '#111827',
        
        // Light Mode Palette
        'light-gray': '#e5e7eb',
        'off-white': '#f9fafb',
      },
      fontFamily: {
        // Headings, Brand, CTAs
        display: ['Montserrat', 'sans-serif'],
        // Body text, descriptions
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        // Display - Hero titles
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-md': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-sm': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '800' }],
        
        // Headings - Section titles
        'h1': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'h2': ['1.875rem', { lineHeight: '1.3', fontWeight: '700' }],
        'h3': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h4': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        
        // Body text
        'body-lg': ['1.125rem', { lineHeight: '1.7', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        
        // UI elements
        'label': ['0.875rem', { lineHeight: '1.25', fontWeight: '500', letterSpacing: '0.025em' }],
        'caption': ['0.75rem', { lineHeight: '1.25', fontWeight: '400' }],
      },
      spacing: {
        // Consistent spacing scale
        'section': '6rem',    // 96px - Between major sections
        'section-sm': '4rem', // 64px - Between subsections
        'content': '2rem',    // 32px - Between content blocks
        'element': '1rem',    // 16px - Between related elements
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
