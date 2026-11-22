import { defineConfig } from 'vitest/config'

// Node unit tests only. This file is separate from app.config.ts so Vitest
// does not load the TanStack Start, Nitro, or Tailwind dev plugins.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
