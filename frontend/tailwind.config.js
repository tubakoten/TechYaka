/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Karanlık tema desteğini aktif ediyoruz
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2563eb', // TechYaka Electric Blue - Teknoloji ve güven
          green: '#22c55e', // Neon Green - "Başvur" butonları ve aktiflik
          dark: '#1d1d1f', // Space Gray - Ana arka plan
          light: '#ffffff', // Pure White - Metinler
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Modern, kod dostu tipografi
      }
    },
  },
  plugins: [],
}