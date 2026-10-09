import { Schema } from '@tiptap/pm/model'
import type { SchemaSpec } from '@tiptap/pm/model'

import type { Editor } from '../Editor.js'
import type { Extensions } from '../types.js'
import { getSchemaAttributes } from '../schema/getSchemaAttributes.js'
import { mergeSchemaSpec } from '../schema/mergeSchemaSpec.js'
import { findDuplicates } from '../utilities/findDuplicates.js'
import { getAttributesFromExtensions } from './getAttributesFromExtensions.js'
import { getSchemaSpecByResolvedExtensions } from './getSchemaSpecByResolvedExtensions.js'

/**
 * Creates a ProseMirror schema from resolved extensions.
 * @param extensions The flattened and sorted extensions
 * @param editor The editor instance
 * @param schemaSpec The external structure to use with local extension behavior
 * @returns A ProseMirror schema
 */
export function getSchemaByResolvedExtensions(
  extensions: Extensions,
  editor?: Editor,
  schemaSpec?: SchemaSpec,
): Schema {
  if (schemaSpec === undefined) {
    return new Schema(getSchemaSpecByResolvedExtensions(extensions, editor))
  }

  const duplicates = findDuplicates(
    extensions.filter(extension => extension.type !== 'extension').map(extension => extension.name),
  )

  if (duplicates.length) {
    throw new RangeError(`Duplicate local schema types: ${duplicates.join(', ')}`)
  }

  const external = new Schema(schemaSpec)
  const attributes = getSchemaAttributes(getAttributesFromExtensions(extensions), external)
  const local = getSchemaSpecByResolvedExtensions(extensions, editor, attributes)

  return new Schema(mergeSchemaSpec(local, external))
}
