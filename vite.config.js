import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // On this Windows drive the normal file watcher sometimes misses saves, so the open page keeps old code.
    // Polling checks the files on a timer instead: a little more CPU, but every change reaches the page.
    watch: { usePolling: true, interval: 300 },
  },
})
