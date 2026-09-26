import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/gaborulenius_2025/",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "vendor-react";
          }
          if (id.includes("node_modules/@mui/icons-material/")) {
            return "vendor-mui-icons";
          }
          if (
            id.includes("node_modules/@mui/material/") ||
            id.includes("node_modules/@mui/system/") ||
            id.includes("node_modules/@mui/lab/") ||
            id.includes("node_modules/@mui/utils/") ||
            id.includes("node_modules/@mui/private-theming/") ||
            id.includes("node_modules/@mui/styled-engine/")
          ) {
            return "vendor-mui";
          }
          if (id.includes("node_modules/@emotion/")) {
            return "vendor-emotion";
          }
          if (
            id.includes("node_modules/react-intl/") ||
            id.includes("node_modules/@formatjs/")
          ) {
            return "vendor-intl";
          }
        },
      },
    },
  },
});
