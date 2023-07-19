# rollup-plugin-replace

Code for leaning, based on `@rollup/plugin-replace`.
Both support for rollup and vite.

## Get Start

1. Install:

```bash
pnpm add @gyhyfj/rollup-plugin-replace -D
```

2. Usage:

```ts
plugins: [
  replacePlugin({
    // [RegExp|string, string][]
    replace: [
      ['book', 'cat'],
      [/!((?<=(\<|\<\/))template(?=\>))/i, 'cat'],
    ],
    // [RegExp|string]
    include: ['**/*.(vue|tsx|jsx|ts|js)'],
    exclude: ['node_modules/**'],
  }),
],
```
