import type { ExtensionConfig } from '../Extension.js'
import type { MarkConfig } from '../Mark.js'
import type { NodeConfig } from '../Node.js'
import type { AnyExtension, MaybeThisParameterType, RemoveThis } from '../types.js'

/**
 * Returns a field from an extension
 * @param extension The Tiptap extension
 * @param field The field, for example `renderHTML` or `priority`
 * @param context The context object that should be passed as `this` into the function
 * @returns The field value
 */
export function getExtensionField<T = any, E extends AnyExtension = any>(
  extension: E,
  field: keyof ExtensionConfig | keyof MarkConfig | keyof NodeConfig,
  context?: Omit<MaybeThisParameterType<T>, 'parent'>,
): RemoveThis<T> {
  if (extension.config[field as keyof typeof extension.config] === undefined && extension.parent) {
    return getExtensionField(extension.parent, field, context)
  }

  if (typeof extension.config[field as keyof typeof extension.config] === 'function') {
    const value = (extension.config[field as keyof typeof extension.config] as any).bind({
      ...context,
      parent: extension.parent ? getExtensionField(extension.parent, field, context) : null,
    })

    return value
  }

  return extension.config[field as keyof typeof extension.config] as RemoveThis<T>
}
