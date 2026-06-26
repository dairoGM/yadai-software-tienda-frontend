import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'brought-blemish-employed.ngrok-free.dev' // 👈 Solo el dominio, sin http:// ni /
    ]
  }
})