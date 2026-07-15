import { defineConfig } from 'vitest/config';

// Test configuration for the Node.js environment (successor of jest.config.node.js).
export default defineConfig({
  test: {
    include: ['test/**/*.spec.ts'],
    environment: 'node',
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['src/**/*.ts'],
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage/vitest-node',
    },
  },
});
