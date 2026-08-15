import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'NOD MESS',
        short_name: 'NOD MESS',
        description: 'Taşınabilir EV şarj cihazı kiralama platformu',
        theme_color: '#0B0B0C',
        background_color: '#0B0B0C',
        display: 'standalone',
        icons: [],
      },
    }),
  ],
})
