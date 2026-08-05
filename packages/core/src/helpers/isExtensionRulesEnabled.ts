import type { AnyExtension, EnableRules } from '../types.js'

/**
 * Check whether input and paste rules should run for an extension.
 * `enabled` is either a boolean for all extensions, or a list of the ones to allow.
 */
export function isExtensionRulesEnabled(extension: AnyExtension, enabled: EnableRules): boolean {
  if (Array.isArray(enabled)) {
    return enabled.some(enabledExtension => {
      const name = typeof enabledExtension === 'string' ? enabledExtension : enabledExtension.name

      return name === extension.name
    })
  }

  return enabled
}
