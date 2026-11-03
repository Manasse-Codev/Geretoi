import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(viteConfig, defineConfig({
  test: {
    include: ['src/features/tasks/tasks.integration.ts'],
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 30000,
  },
}));
