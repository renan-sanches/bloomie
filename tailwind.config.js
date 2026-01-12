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
                primary: '#64b478',
                'primary-dark': '#4a8a5b',
                'primary-light': '#a8d5b4', // Computed lighter shade of #64b478

                // Accent colors from Guidelines
                'accent-water': '#66BBE6',
                'accent-mist': '#A3E0E0',
                'accent-fert': '#E6B08A',
                'accent-pink': '#F48FB1',
                'accent-purple': '#CE93D8',
                'accent-orange': '#FFB74D',
                'accent-cyan': '#66BBE6', // Map to water for backward compatibility
                'accent-coral': '#E6B08A', // Map to fert for backward compatibility
                'accent-alert': '#F48FB1', // Map to pink

                // Backgrounds
                'background-light': '#F8F9F8', // bg-page from guidelines
                'background-dark': '#0f172a',
                'surface-light': '#ffffff',
                'surface-dark': '#2c3630',
                'text-dark': '#131614', // Carbon Text
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
