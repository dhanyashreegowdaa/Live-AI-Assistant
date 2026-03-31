// Minimal ESLint flat config so `npm run lint` works out of the box.
// This repo is intentionally lightweight; we avoid heavy rule/plugin requirements.

module.exports = [
  {
    ignores: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/build/**"],
  },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // Keep lint actionable but not overly strict for this starter project.
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },
];

