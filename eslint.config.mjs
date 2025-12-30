import js from "@eslint/js";
import { fixupPluginRules } from "@eslint/compat";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: {
            "@next/next": fixupPluginRules(nextPlugin),
            "react": fixupPluginRules(reactPlugin),
            "react-hooks": fixupPluginRules(hooksPlugin),
        },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            ...hooksPlugin.configs.recommended.rules,
            ...nextPlugin.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "@next/next/no-img-element": "off", // Optional, typical in Next.js
        },
        settings: {
            react: {
                version: "detect",
            }
        },
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        }
    },
    {
        ignores: [".next/*", "node_modules/*", "public/*", "prisma/seed.js"],
    }
];
