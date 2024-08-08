import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'
import tsconfigPaths from 'vite-tsconfig-paths'

import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    eslint(),
    tsconfigPaths(), react()],
  base: process.env.BASE_URL ?? '/',
  build: {
    target:'ES2022',
    sourcemap: true,
  },
})
