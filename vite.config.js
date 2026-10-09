import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Fixed port: the backend's CORS allow-list is locked to localhost:5173 (docs/api-contract.md).
  server: { port: 5173, strictPort: true },
})
