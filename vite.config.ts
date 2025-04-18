import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/New_Hamlet_Beyond_the_Five_Acts/',
  server: {
    proxy: {
      // '/api': {
      //   target: 'http://103.194.106.155', 
      //   changeOrigin: true,
      //   secure: false
      // }
    }
  }
})
