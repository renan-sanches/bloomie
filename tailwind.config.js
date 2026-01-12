/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
        './lib/**/*.{js,jsx,ts,tsx}',
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                // Primary greens
                primary: '#4ade80',
                'primary-dark': '#16a34a',
                'primary-light': '#86efac',

                // Accent colors from Stitch design
                'accent-pink': '#f43f5e',
                'accent-purple': '#8b5cf6',
                'accent-orange': '#f9a620',
                'accent-cyan': '#26d0ce',
                'accent-coral': '#f15a5e',
                'accent-alert': '#ef4444',

                // Backgrounds
                'background-light': '#f8fafc',
                'background-dark': '#0f172a',
                'surface-light': '#ffffff',
                'surface-dark': '#2c3630',
            },
            fontFamily: {
                sans: ['PlusJakartaSans-Regular', 'sans-serif'],
                display: ['PlusJakartaSans-Bold', 'sans-serif'],
                brand: ['PlusJakartaSans-SemiBold', 'sans-serif'],
                body: ['PlusJakartaSans-Regular', 'sans-serif'],
            },
            borderRadius: {
                DEFAULT: '0.5rem',
                lg: '1rem',
                xl: '1.5rem',
                '2xl': '2rem',
                '3xl': '2.5rem',
                full: '9999px',
            },
            boxShadow: {
                'soft-green': '0 10px 40px -10px rgba(74, 222, 128, 0.15)',
                'card-hover': '0 20px 40px -10px rgba(74, 222, 128, 0.25)',
                'vibrant-pink': '0 10px 25px -5px rgba(244, 63, 94, 0.3)',
                'vibrant-purple': '0 10px 25px -5px rgba(139, 92, 246, 0.3)',
            },
        },
    },
    plugins: [],
};
