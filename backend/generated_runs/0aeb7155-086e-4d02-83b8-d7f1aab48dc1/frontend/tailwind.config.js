/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'calculator-bg': '#f5f5f5',
        'button-primary': '#4a90e2',
        'button-secondary': '#e0e0e0',
        'button-text': '#333333',
        'display-bg': '#ffffff',
        'display-text': '#000000',
      },
      borderRadius: {
        'calculator': '12px',
        'button': '8px',
      },
      boxShadow: {
        'calculator': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'button': '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};