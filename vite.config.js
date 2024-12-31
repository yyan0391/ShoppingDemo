import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
// import Components from 'unplugin-vue-components/vite';
// import { VantResolver } from 'unplugin-vue-components/resolvers';

// https://vite.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.jpeg', '**/*.jpg', '**/*.png'], // 添加支持的图片格式
  plugins: [
    vue(),
    // vueDevTools(),
    
    // Components({
    //   resolvers: [VantResolver()],
    // }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
