import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        skipWaiting: true,   // 새 서비스워커 즉시 활성화 (캐시 구버전 방지)
        clientsClaim: true,
      },
      manifest: {
        name: '공쓰재',
        short_name: '공쓰재',
        description: '공연에 쓰고 남은 물건과 일자리를 나눕니다',
        theme_color: '#2D6A4F',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
