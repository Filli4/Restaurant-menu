// tailwind.config.cts
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}", // Include if you might use pages dir
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // Essential for App Router
  ],
  theme: {
    extend: {
      // You can add custom theme extensions here
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        bounceOnce: 'bounceOnce 0.8s ease-out',
      },
      keyframes: {
        bounceOnce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
      },
    },
  },
  plugins: [
    
  ], // Add official plugins here if needed (e.g., require('@tailwindcss/forms'))
}