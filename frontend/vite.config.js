import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    // port: 80,
    // host: 'localhost'
  },
  plugins: [react(), tailwindcss()],
});
