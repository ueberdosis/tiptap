import { Schema } from '@tiptap/pm/model'

import { Editor } from '../Editor.js'
import { Extensions } from '../types.js'
import { getSchemaByResolvedExtensions } from './getSchemaByResolvedExtensions.js'
import { resolveExtensions } from './resolveExtensions.js'

export function getSchema(extensions: Extensions, editor?: Editor): Schema {
  const resolvedExtensions = resolveExtensions(extensions)

  return getSchemaByResolvedExtensions(resolvedExtensions, editor)
}
