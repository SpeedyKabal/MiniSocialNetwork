import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";

// Load environment variables from the new .env file location
dotenv.config({ path: "../.env" });

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    // port: 80,
    // host: 'localhost'
  },
  plugins: [react(), tailwindcss()],
});
