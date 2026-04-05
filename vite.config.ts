import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { version } from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [preact(), tailwindcss(), tsconfigPaths()],
    define: {
        __APP_VERSION__: JSON.stringify(version),
    },
});
