import { rollup } from 'rollup'
import type { OutputOptions, Plugin, RollupOutput } from 'rollup'

export const bundleCode = async (inputCode: string, plugins?: Plugin[]) => {
  // start
  const bundle = await rollup({
    input: 'main.js',
    plugins,
  })

  // generate
  const output = await bundle.generate({
    format: 'esm',
  })
  return output.output[0].code.trim()
}
