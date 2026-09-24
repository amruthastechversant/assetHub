import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["tests/permissions.test.ts"], // kept on Node's built-in runner
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: [
        "src/lib/format.ts",
        "src/lib/permissions.ts",
        "src/components/device/**/*.tsx",
        "src/app/api/report-issue/route.ts",
        "src/app/api/devices/role/route.ts",
      ],
      exclude: [
        "src/**/*.d.ts",
        "src/**/index.ts",
        // Layout shell and client-navigation component — covered by E2E, not unit tests
        "src/components/device/DeviceLayout.tsx",
        "src/components/device/RoleBadgeBar.tsx",
      ],
      thresholds: {
        statements: 75,
        branches: 70,
        functions: 75,
        lines: 75,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
