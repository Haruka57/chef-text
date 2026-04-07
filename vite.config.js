import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/chef/', // 🔥 加上这一行核心代码，注意前后都有斜杠
})
