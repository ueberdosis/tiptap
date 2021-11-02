import { AnyExtension, EnableRules } from '@tiptap/core'

export default function isExtensionRulesEnabled(extension: AnyExtension, enabled: EnableRules): boolean {
  if (Array.isArray(enabled)) {
    return enabled.some(enabledExtension => {
      const name = typeof enabledExtension === 'string'
        ? enabledExtension
        : enabledExtension.name

      return name === extension.name
    })
  }

  return enabled
}
