import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [eslint(), tsconfigPaths(), react()],
  base: process.env.BASE_URL ?? '/',
  build: {
    target:'ES2022',
    sourcemap: true,
  },
})
