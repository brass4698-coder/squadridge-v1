import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

/** Flat ESLint config (ESLint 9+). Extend with `eslint-plugin-import` `import/order` when ready. */
export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage', '*.config.*', 'supabase/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'unused-imports': unusedImports,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-hooks/set-state-in-effect': 'off',
      /** Current codebase uses refs in render-adjacent patterns; tighten incrementally. */
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/static-components': 'off',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    /**
     * Tighter rule for `src/lib/**` (production-data helpers, Supabase wrappers,
     * the redaction engine, etc.). All console use must go through the
     * structured logger in `src/lib/log.ts`; the CI script
     * `scripts/check-no-raw-console.mjs` provides the run-time gate. This
     * ESLint rule provides the editor-time signal — opt out per-line with
     * `// eslint-disable-next-line no-console` and a one-line comment explaining
     * why (see `src/lib/sentry.ts` and `src/lib/redaction-engine/.../roomScoped.ts`).
     *
     * `no-restricted-syntax` is used (rather than tightening `no-console`)
     * because flat-config rule merging would otherwise inherit the project-wide
     * `allow: ['warn', 'error']` option and let warn/error through.
     */
    files: ['src/lib/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.object.name='console'][callee.property.name=/^(log|info|debug|warn|error)$/]",
          message:
            'Use logInfo/logWarn/logError from src/lib/log.ts in production-data paths. Per-line override: `// eslint-disable-next-line no-restricted-syntax` with a comment.',
        },
      ],
    },
  },
);
