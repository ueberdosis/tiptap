import { AnyExtension, MaybeThisParameterType, RemoveThis } from '../types.js'

/**
 * Returns a field from an extension
 * @param extension The Tiptap extension
 * @param field The field, for example `renderHTML` or `priority`
 * @param context The context object that should be passed as `this` into the function
 * @returns The field value
 */
export function getExtensionField<T = any>(
  extension: AnyExtension,
  field: string,
  context?: Omit<MaybeThisParameterType<T>, 'parent'>,
): RemoveThis<T> {

  if (extension.config[field] === undefined && extension.parent) {
    return getExtensionField(extension.parent, field, context)
  }

  if (typeof extension.config[field] === 'function') {
    const value = extension.config[field].bind({
      ...context,
      parent: extension.parent
        ? getExtensionField(extension.parent, field, context)
        : null,
    })

    return value
  }

  return extension.config[field]
}
