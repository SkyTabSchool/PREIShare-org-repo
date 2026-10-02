import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { nitro } from 'nitro/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// This repo uses TanStack Start 1.168, which configures the app through Vite.
// `@tanstack/react-start/config` (the older Vinxi `defineConfig`) is not exported here.
// Dashboard child routes are not registered in this file.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  server: {
    port: 3000,
  },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({
      srcDirectory: 'src',
    }),
    nitro(),
    viteReact(),
  ],
})
