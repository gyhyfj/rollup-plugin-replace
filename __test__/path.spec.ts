import ReplacePlugin, { type Options } from '../src'
import { bundleCode } from './utils'
import type { Plugin } from 'rollup'
import { win32, resolve, posix, isAbsolute } from 'path'

describe('Path resolve', () => {
  const inputCode = "console.log('A');"
  const changedCode = "console.log('B');"

  const ResolvePlugin = (path: string): Plugin => ({
    name: '',
    resolveId(id) {
      if (id === 'main.js') {
        return path
      }
    },
    load(id) {
      if (id === path) {
        return inputCode
      }
    },
  })

  const buildCode = async (path: string, options: Omit<Options, 'replace'>) =>
    await bundleCode(inputCode, [
      ResolvePlugin(path),
      ReplacePlugin({ ...options, replace: [['A', 'B']] }),
    ])

  const modulePath = posix.join(
    resolve('').split(win32.sep).join(posix.sep),
    '123.ts' // Absolute path of 123.ts at root of project
  )

  const virtualModulePath = '\0' + modulePath

  it('Include rules', async () => {
    // 123.ts at root path of project
    expect(await buildCode(modulePath, { include: ['123.ts'] })).toBe(
      changedCode
    )
    // 123.ts at any path
    expect(await buildCode(modulePath, { include: ['**/123.ts'] })).toBe(
      changedCode
    )
    // *.ts at root path
    expect(await buildCode(modulePath, { include: ['*.ts'] })).toBe(changedCode)
    // *.ts at any path
    expect(await buildCode(modulePath, { include: ['**/*.ts'] })).toBe(
      changedCode
    )
    // a.ts at any path
    expect(await buildCode(modulePath, { include: ['**/a.ts'] })).toBe(
      inputCode
    )
  })

  it('Exclude rules', async () => {
    // 123.ts at root path of project
    expect(await buildCode(modulePath, { exclude: ['123.ts'] })).toBe(inputCode)
    // 123.ts at any path
    expect(await buildCode(modulePath, { exclude: ['**/123.ts'] })).toBe(
      inputCode
    )
    // *.ts at root path
    expect(await buildCode(modulePath, { exclude: ['*.ts'] })).toBe(inputCode)
    // *.ts at any path
    expect(await buildCode(modulePath, { exclude: ['**/*.ts'] })).toBe(
      inputCode
    )
    // a.ts at any path
    expect(await buildCode(modulePath, { exclude: ['a.ts'] })).toBe(changedCode)
  })

  it('Include and Exclude rules', async () => {
    // both satisfy include and exclude, exclude take precedence
    expect(
      await buildCode(modulePath, { include: ['*.ts'], exclude: ['123.ts'] })
    ).toBe(inputCode)

    expect(
      await buildCode(modulePath, { include: ['123.ts'], exclude: ['*.ts'] })
    ).toBe(inputCode)
  })

  it('Virtual module', async () => {
    // virtual module will be ignore anyway
    expect(await buildCode(virtualModulePath, {})).toBe(inputCode)

    expect(await buildCode(virtualModulePath, { include: ['123.ts'] })).toBe(
      inputCode
    )
  })
})
