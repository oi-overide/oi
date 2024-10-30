import globals from "globals";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";

export default [
  {
    files: ["**/*.ts"],
    ignores: ["tsup.config.ts"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json"
      },
      globals: { ...globals.node }
    },
    plugins: {
      "@typescript-eslint": typescript,
      prettier: prettier
    },
    rules: {
      ...typescript.configs["recommended"].rules,
      "prettier/prettier": ["error", {
        semi: true,
        trailingComma: "none",
        singleQuote: true,
        printWidth: 100,
        tabWidth: 2,
        useTabs: false,
        bracketSpacing: true,
        arrowParens: "avoid",
        endOfLine: "crlf"
      }],
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
];
