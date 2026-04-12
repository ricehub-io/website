import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import globals from "globals";

export default defineConfig(
    {
        ignores: ["dist/", "node_modules/"],
    },
    {
        files: ["**/*.{ts,tsx}"],
        extends: [...tseslint.configs.recommended],
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
    }
);
