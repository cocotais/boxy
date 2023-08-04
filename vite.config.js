import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) =>
            ["field", "block", "category", "xml", "mutation", "value", "sep", "shadow", "iconpark-icon"].includes(tag),
        },
      },
    }),
    viteStaticCopy({
      targets: [
        {
          src: fileURLToPath(new URL("./src/icon/logo/boxy.svg", import.meta.url)),
          dest: "./",
        },
        {
          src: fileURLToPath(new URL("./src/icon/logo/favicon.ico", import.meta.url)),
          dest: "./",
        },
        {
          src: fileURLToPath(new URL("./node_modules/blockly/media/*", import.meta.url)),
          dest: "media",
        },
      ],
    }),
    VitePWA({
      mode: "production",
      base: "/",
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        runtimeCaching: [
          {
            // 根据正则表达式进行缓存，如果你喜欢 也可以使用/.*/i
            urlPattern: /.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "boxy-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 1.5,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: "Boxy",
        short_name: "Boxy",
        description: "Basic available instance built on Google Blockly.",
        theme_color: "#4062f6",
        start_url: "/",
        id: "boxy",
        icons: [
          {
            src: "boxy.svg",
            sizes: "150x150",
          },
          {
            src: "favicon.ico",
            sizes: "256x256",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
