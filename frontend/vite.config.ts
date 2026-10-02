import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";

export default defineConfig({
    server: {
        proxy: {
            "/api": "http://localhost:3000",
        },
    },
    plugins: [
        vue({ template: { transformAssetUrls } }),
        quasar(),
    ],
});
