{\rtf1\ansi\ansicpg949\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx566\tx1133\tx1700\tx2267\tx2834\tx3401\tx3968\tx4535\tx5102\tx5669\tx6236\tx6803\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import \{ defineConfig \} from 'vite'\
import react from '@vitejs/plugin-react'\
import \{ VitePWA \} from 'vite-plugin-pwa'\
\
export default defineConfig(\{\
  plugins: [\
    react(),\
    VitePWA(\{\
      registerType: 'autoUpdate',\
      manifest: \{\
        name: '\uc0\u44277 \u50416 \u51116 ',\
        short_name: '\uc0\u44277 \u50416 \u51116 ',\
        description: '\uc0\u44277 \u50672 \u50640  \u50416 \u44256  \u45224 \u51008  \u47932 \u44148 \u44284  \u51068 \u51088 \u47532 \u47484  \u45208 \u45589 \u45768 \u45796 ',\
        theme_color: '#2D6A4F',\
        background_color: '#ffffff',\
        display: 'standalone',\
        start_url: '/',\
        icons: [\
          \{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' \},\
          \{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' \}\
        ]\
      \}\
    \})\
  ]\
\})}