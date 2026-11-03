import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(viteConfig, defineConfig({
  test: {
    include: ['src/features/auth/rulesEmulator.ts'],
    environment: 'node',
    testTimeout: 15000,
    hookTimeout: 30000,
  },
}));
