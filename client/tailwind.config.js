/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Libra Palette (Goodreads x StoryGraph)
                paper: {
                    50: 'var(--paper-50)',
                    100: 'var(--paper-100)',
                    200: 'var(--paper-200)',
                },
                ink: {
                    900: 'var(--ink-900)',
                    600: 'var(--ink-600)',
                    400: 'var(--ink-400)',
                },
                teal: {
                    600: '#0d9488', // Primary Accent (StoryGraph-ish)
                    700: '#0f766e',
                    50: '#f0fdfa', // Highlight
                },
                amber: {
                    500: '#f59e0b', // Stars / Reading Status
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Body
                serif: ['Merriweather', 'serif'], // Headings (Goodreads flavor)
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
            },
        },
    },
    plugins: [],
}
