import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/New_Hamlet/',
  // 添加代理配置
  server: {
    proxy: {
      '/api': {
        target: 'http://103.194.106.155',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
