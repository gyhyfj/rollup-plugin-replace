import ReplacePlugin, { type Options } from '../src'
import { bundleCode } from './utils'
import type { Plugin } from 'rollup'

describe('Replace rules test', () => {
  const inputCode = "console.log('A');"

  const ResolvePlugin: Plugin = {
    name: '',
    resolveId(id) {
      return id
    },
    load(id) {
      if (id === 'main.js') {
        return inputCode
      }
    },
  }

  const buildCode = async (options: Options) =>
    await bundleCode(inputCode, [ResolvePlugin, ReplacePlugin(options)])

  it('String to string', async () => {
    // Single rule
    expect(
      await buildCode({
        replace: [['A', '123']],
      })
    ).toBe("console.log('123');")

    // Multiple rules
    expect(
      await buildCode({
        replace: [
          ['A', '123'],
          ['log', 'warn'],
        ],
      })
    ).toBe("console.warn('123');")
  })

  it('RegExp to string', async () => {
    // Normal reg
    expect(await buildCode({ replace: [[/a/gi, '123']] })).toBe(
      "console.log('123');"
    )

    // Special reg
    expect(await buildCode({ replace: [[/(?<=l)o/, 'x']] })).toBe(
      "console.lxg('A');"
    )

    // Multiple reg
    expect(
      await buildCode({
        replace: [
          [/(?<=s)o|(o(?=g))/g, 'x'],
          [/(?<=s)x/, 'o'],
        ],
      })
    ).toBe("console.lxg('A');")
  })

  it('String & RegExp to string', async () => {
    expect(
      await buildCode({
        replace: [
          ['A', 'x'],
          [/(?<=s)x/, 'o'],
        ],
      })
    ).toBe("console.log('x');")
  })
})

describe('Path resolve', () => {
  it('Include rules', async () => {
    expect(1).toBe(1)
  })
})
