import { Schema } from '@tiptap/pm/model'

import { Editor } from '../Editor.js'
import { ExtensionManager } from '../ExtensionManager.js'
import { Extensions } from '../types.js'
import { getSchemaByResolvedExtensions } from './getSchemaByResolvedExtensions.js'

export function getSchema(extensions: Extensions, editor?: Editor): Schema {
  const resolvedExtensions = ExtensionManager.resolve(extensions)

  return getSchemaByResolvedExtensions(resolvedExtensions, editor)
}
