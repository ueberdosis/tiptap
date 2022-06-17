import { AnyExtension, MaybeThisParameterType, RemoveThis } from '../types'

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
