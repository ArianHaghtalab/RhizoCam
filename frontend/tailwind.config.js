/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}", // Path to your React components
      "./public/index.html"         // Path to your main HTML file
    ],
    theme: {
      extend: {
        colors: {
          'brand-cta': '#FFA725',
          'brand-bg': '#FFFBF2',
          'brand-bg-alt': '#F8FBF8',
          'brand-accent-light': '#C1D8C3',
          'brand-accent-dark': '#6A9C89',
          'brand-heading': '#3A564F',
          'brand-body': '#4A5568',
          'slate-200': '#E2E8F0',
          'slate-500': '#64748B',
          'slate-100': '#F1F5F9',
          'slate-400': '#94A3B8',
        },
      },
    },
    plugins: [],
  }