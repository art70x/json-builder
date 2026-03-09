/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */

export default {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  printWidth: 100,
  plugins: [
    'prettier-plugin-organize-attributes',
    'prettier-plugin-css-order',
    'prettier-plugin-organize-imports',
    'prettier-plugin-tailwindcss',
  ],
  attributeGroups: ['^className$', '$DEFAULT', '^title$', '^aria-', '^data-'],
  cssDeclarationSorterOrder: 'frakto',
  cssDeclarationSorterKeepOverrides: false,
  tailwindStylesheet: './src/main.css',
  tailwindPreserveWhitespace: true,
  tailwindPreserveDuplicates: true,
}
