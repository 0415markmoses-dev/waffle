import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
        'react/prop-types': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
        // {node, ...rest} = props is a common React pattern to strip a prop
        // before spreading the remainder onto a real DOM element — that's a
        // deliberate use of `node`, not dead code.
        'no-unused-vars': ['error', {ignoreRestSiblings: true}],
    },
  },
    {
        // vite.config.js has test.globals = true, so Vitest injects describe/it/
        // expect/vi/beforeEach/afterEach etc. into every tests/**/*.js file at
        // runtime without an explicit import — tell ESLint about them too,
        // otherwise it flags every single one as an undefined global.
        files: ['tests/**/*.{js,jsx}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.vitest,
            },
        },
        rules: {
            // Every hook test wraps renderHook() in an inline, anonymous
            // QueryClientProvider — a test-only helper, not part of the real
            // component tree, so a display name buys nothing here.
            'react/display-name': 'off',
    },
  },
]
