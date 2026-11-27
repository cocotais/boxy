export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-clean-order',
    'stylelint-config-recommended-vue',
    'stylelint-config-recommended-less'
  ],
  overrides: [{ files: ['**/*.vue'], customSyntax: 'postcss-html' }],
  rules: {
    'selector-id-pattern': null,
    'selector-class-pattern': null,
    // These Less rules target separate component trees; source order cannot
    // change which elements they match.
    'no-descending-specificity': null
  }
}
