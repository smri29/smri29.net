/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "dark-bg": "#050505",
        "neon-pink": "#ec4899",
      },
      fontFamily: {
        // Add this line to create a 'serif' utility that uses Times New Roman
        serif: ['"Times New Roman"', 'Times', 'serif'], 
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}