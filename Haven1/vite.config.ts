import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/JovonkaJohnson-/", // 👈 add trailing slash and match repo name exactly
})
