import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    allowedHosts: [
      'light.asuno.net',
      'appcharge.incotexpower.ru'
    ],
    proxy: {
      "/api": {
        target: "https://charge.incotexpower.ru",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    watch: {
      ignored: ['/**.git**/'],
    },
  },
  plugins: [
    vue(),
    vueJsx(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'views': fileURLToPath(new URL('./src/views', import.meta.url)),
      'components': fileURLToPath(new URL('./src/components', import.meta.url)),
      'lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
      'utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
    }
  }
});
