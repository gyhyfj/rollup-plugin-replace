import picomatch from 'picomatch'
import { win32, resolve, posix, isAbsolute } from 'path'

type ValidReplaceRule = [RegExp, string]
type ReplaceRule = ValidReplaceRule | [string, string]
type PathRule = RegExp | string

export type Options = {
  replace: ReplaceRule[]
  include?: PathRule[]
  exclude?: PathRule[]
}

let validRules: ValidReplaceRule[]
let filter: ReturnType<typeof createFilter>

/**
 * Generate available rules
 * @param rules
 */
const createValidRules = (rules: ReplaceRule[]) => {
  const isValidRule = (rule: ReplaceRule): rule is ValidReplaceRule => {
    return typeof rule[0] !== 'string'
  }

  const strToReg = (str: string, flags?: string) =>
    new RegExp(str.replace(/[-.*+?^${}()|[\]\\]/g, '\\$&'), flags)

  const getValidRule = (rule: ReplaceRule): ValidReplaceRule => {
    return isValidRule(rule) ? rule : [strToReg(rule[0], 'g'), rule[1]]
  }

  return rules.map(getValidRule)
}

/**
 * apply replace rules to code
 * @param code
 */
const replaceReducer = (code: string): string => {
  return validRules.reduce((code, rule) => code.replace(rule[0], rule[1]), code)
}

/**
 * create id filter by include and exclude in plugin option
 * @param include
 * @param exclude
 */
const createFilter = (include?: PathRule[], exclude?: PathRule[]) => {
  const normalizePath = (path: string) => path.split(win32.sep).join(posix.sep)

  const normalizePathRuleString = (rule: string) => {
    if (isAbsolute(rule) || rule.startsWith('**')) {
      return normalizePath(rule)
    }
    const basePath = normalizePath(resolve(''))
    return posix.join(basePath, normalizePath(rule))
  }
  const toRegRule = (pathRule: PathRule) =>
    pathRule instanceof RegExp
      ? pathRule
      : picomatch.makeRe(normalizePathRuleString(pathRule), { dot: true })
  const includeRules = include?.map(rule => toRegRule(rule)) ?? []
  const excludeRules = exclude?.map(rule => toRegRule(rule)) ?? []
  return (id: string | unknown) => {
    if (typeof id !== 'string') return false
    if (/\0/.test(id)) return false
    const pathId = normalizePath(id)
    for (const reg of excludeRules) {
      if (reg.test(pathId)) return false
    }
    for (const reg of includeRules) {
      if (reg.test(pathId)) return true
    }
    return !includeRules.length
  }
}

export default (pluginOption: Options) => {
  return {
    name: 'rollup-plugin-replace',
    buildStart() {
      validRules = createValidRules(pluginOption.replace)
      filter = createFilter(pluginOption.include, pluginOption.exclude)
    },
    transform(code: string, id: string) {
      if (!filter(id)) {
        return null
      }
      return replaceReducer(code)
    },
  }
}
