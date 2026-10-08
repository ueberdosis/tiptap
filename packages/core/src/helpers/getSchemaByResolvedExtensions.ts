import { Schema } from '@tiptap/pm/model'

import type { Editor } from '../Editor.js'
import type { Extensions } from '../types.js'
import { getSchemaSpecByResolvedExtensions } from './getSchemaSpecByResolvedExtensions.js'

/**
 * Creates a ProseMirror schema from resolved extensions.
 * @param extensions The flattened and sorted extensions
 * @param editor The editor instance
 * @returns A ProseMirror schema
 */
export function getSchemaByResolvedExtensions(extensions: Extensions, editor?: Editor): Schema {
  return new Schema(getSchemaSpecByResolvedExtensions(extensions, editor))
}
