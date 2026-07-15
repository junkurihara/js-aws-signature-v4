import { defineConfig } from 'vitest/config';

// Test configuration for the "web" flavor (successor of jest.config.web.js).
// As in the former jest config, it actually runs in the node environment
// (jsdom was commented out there); only the coverage output directory differs.
export default defineConfig({
  test: {
    include: ['test/**/*.spec.ts'],
    environment: 'node',
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['src/**/*.ts'],
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage/vitest-web',
    },
  },
});
