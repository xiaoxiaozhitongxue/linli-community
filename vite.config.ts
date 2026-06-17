import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  base: '',
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 将所有 view 和 text 标签视为自定义元素
          isCustomElement: (tag) => ['view', 'text', 'scroll-view', 'swiper', 'swiper-item', 'image', 'input', 'navigator'].includes(tag)
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 8080,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'https://a9d34a67.linli-community.pages.dev',
        changeOrigin: true
      }
    }
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
