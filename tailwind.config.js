/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Colores del diseño final
        'primary-blue': '#1BA3D7',
        'primary-red': '#E74C3C',
        'chat-bg': '#E1E2E3',
        'message-user': '#FCF5DD',
        'message-ai': '#E74C3C',
        'warning-red': '#E74C3C',
        'success-green': '#27AE60',
      },
    },
  },
  plugins: [],
} 