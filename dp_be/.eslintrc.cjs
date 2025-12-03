module.exports = {
  env: { node: true, es2022: true, jest: true },
  extends: ['standard'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'script' },
  rules: {
    'no-console': 'off',
    'n/no-process-exit': 'off',
    "comma-dangle": 'off',
    "space-before-function-paren": 'off'
  },
}
