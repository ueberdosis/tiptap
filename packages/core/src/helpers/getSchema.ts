import { Schema } from '@tiptap/pm/model'

import { Editor } from '../Editor'
import { ExtensionManager } from '../ExtensionManager'
import { Extensions } from '../types'
import { getSchemaByResolvedExtensions } from './getSchemaByResolvedExtensions'

export function getSchema(extensions: Extensions, editor?: Editor): Schema {
  const resolvedExtensions = ExtensionManager.resolve(extensions)

  return getSchemaByResolvedExtensions(resolvedExtensions, editor)
}
