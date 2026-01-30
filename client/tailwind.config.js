/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Libra Palette (Goodreads x StoryGraph)
                paper: {
                    50: '#fafaf9', // Main Background (Warm White)
                    100: '#f5f5f4', // Secondary BG
                    200: '#e7e5e4', // Borders
                },
                ink: {
                    900: '#1c1917', // Primary Text
                    600: '#57534e', // Secondary Text
                    400: '#a8a29e', // Muted
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
