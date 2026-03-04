import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@smart-link/ui': resolve(__dirname, '../packages/ui/src'),
      '@smart-link/hooks': resolve(__dirname, '../packages/hooks/src'),
      '@smart-link/shared': resolve(__dirname, '../packages/shared/src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api']
      }
    }
  },
  server: {
    port: 5173
  }
})
