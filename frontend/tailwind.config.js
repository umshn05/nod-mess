/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // "urban-tech" koyu tema: zemin siyah/antrasit, aksiyon rengi elektrik limon yeşili
        background: "#0B0B0C", // sayfa zemini (neredeyse siyah)
        surface: "#18181B",    // kart / panel zemini (antrasit)
        "surface-alt": "#232327", // hover / ikincil yüzeyler
        border: "#2A2A2E",
        lime: {
          DEFAULT: "#A3E635", // ana aksiyon rengi (elektrik limon yeşili)
          dark: "#84CC16",    // basılı/hover durumu
          muted: "#3F4A1A",   // devre dışı / arka plan rozeti
        },
        muted: "#9CA3AF", // ikincil metin rengi
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
