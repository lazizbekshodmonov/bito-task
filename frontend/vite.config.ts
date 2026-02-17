import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Pages from "vite-plugin-pages";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import vueDevTools from "vite-plugin-vue-devtools";
import { fileURLToPath, URL } from "node:url";
import VueInspector from "vite-plugin-vue-inspector";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VueInspector({
      launchEditor: "webstorm",
    }),
    vueDevTools({ launchEditor: "webstorm" }),

    // File-based routing
    Pages({
      dirs: "src/pages",
      extensions: ["vue"],
      exclude: ["**/components/**"],
      importMode: "async",
      extendRoute(route) {
        if (!route.meta) {
          route.meta = {};
        }

        if (!route.meta.layout) {
          route.meta.layout = "default";
        }

        return route;
      },
    }),

    AutoImport({
      imports: [
        "vue",
        "vue-router",
        "pinia",
        {
          "naive-ui": ["useDialog", "useMessage", "useNotification", "useLoadingBar"],
          "@tanstack/vue-query": ["useQuery", "useMutation", "useQueryClient"],
        },
      ],
      dts: "src/types/auto-imports.d.ts",
      dirs: ["src/composables", "src/stores"],
      vueTemplate: true,
    }),

    // Auto import components
    Components({
      resolvers: [NaiveUiResolver()],
      dts: "src/types/components.d.ts",
      dirs: ["src/components"],
    }),
  ],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  optimizeDeps: {
    include: ["naive-ui", "vueuc", "date-fns-tz/formatInTimeZone"],
  },

  server: {
    port: 5174,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => {
          return path.replace(/^\/api/, "/api");
        },
      },
      "/socket.io": {
        target: "http://localhost:8080",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
