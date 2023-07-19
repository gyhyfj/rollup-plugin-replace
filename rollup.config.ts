import { defineConfig } from 'rollup'
import terser from '@rollup/plugin-terser'
import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import typescript from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import { DEFAULT_EXTENSIONS } from '@babel/core'

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.mjs',
        format: 'esm',
      },
      {
        file: 'dist/index.cjs',
        format: 'cjs',
      },
    ],
    plugins: [
      commonjs(),
      resolve(),
      typescript({
        tsconfig: 'tsconfig.build.json',
      }),
      babel({
        babelHelpers: 'bundled',
        extensions: [...DEFAULT_EXTENSIONS, '.ts', '.tsx'],
      }),
      terser(),
    ],
  },
])
