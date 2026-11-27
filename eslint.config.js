import js from '@eslint/js'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import vue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  { ignores: ['dist/**', 'stats.html', 'src/assets/categories.js'] },
  js.configs.recommended,
  ...vue.configs['flat/essential'],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    },
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'vue/multi-word-component-names': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error'
    }
  },
  skipFormatting
]
