import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/2D_MCs_edit/",
  test: {
    environment: "node"
  }
});
