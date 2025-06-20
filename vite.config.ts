import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default () => {
  return defineConfig({
    root: "./src",
    base: "",
    plugins: [react(),
      {
        name:"override-config",
        config: () => ({
            build:{
               target:"esnext",
            }
        }),
      }
    ],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  });
};
