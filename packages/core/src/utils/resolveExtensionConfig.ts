import deepmerge from 'deepmerge'
import Extension from '../Extension'
import Node from '../Node'
import Mark from '../Mark'

export default function resolveExtensionConfig(
  extension: Extension | Node | Mark,
  name: string,
  props = {},
): void {
  if (!extension.configs[name]) {
    return
  }

  extension.config[name] = extension.configs[name]
    .reduce((accumulator, { stategy, value: rawValue }) => {
      const value = typeof rawValue === 'function'
        ? rawValue(props)
        : rawValue

      if (accumulator === undefined) {
        return value
      }

      if (stategy === 'overwrite') {
        return value
      }

      if (stategy === 'extend') {
        return deepmerge(accumulator, value)
      }

      return accumulator
    }, undefined)
}