import { AnyExtension, RemoveThis } from '../types'

export default function getExtensionField<T = any>(
  extension: AnyExtension,
  field: string,
  context: Record<string, any> = {},
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
