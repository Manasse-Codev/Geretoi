import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    include: ['src/features/auth/rulesEmulator.ts'],
    environment: 'node',
    testTimeout: 15000,
    hookTimeout: 30000,
  },
});
