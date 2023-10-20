"use strict"

module.exports = {
  overrides: [
    {
      files: "*.{js,ts}",
      options: {
        printWidth: 120,
        tabWidth: 2,
        useTabs: false,
        semi: false,
        singleQuote: true,
        trailingComma: "all",
        bracketSpacing: true,
        arrowParens: "avoid",
      },
    },
  ],
}
