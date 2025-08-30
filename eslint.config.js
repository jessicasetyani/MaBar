import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import typescript from '@vue/eslint-config-typescript'
import prettier from 'eslint-config-prettier'

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/.git/**'],
  },
  js.configs.recommended,
  ...vue.configs['flat/essential'],
  ...typescript(),
  prettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        node: true,
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]