import { type Editor, getExtensionField, Mark } from '@tiptap/core'
import { z } from 'zod'

import type { EditorContext } from './types/editor-context.js'
import type { AddJsonSchemaAwareness, JsonItem } from './types/json-item.js'
import { defaultJsonItems } from './utils/default-json-items.js'
import { mergeJsonItems } from './utils/merge-json-items.js'
import { serializeSchema } from './utils/serialize-schema.js'

/**
 * Options for {@link getEditorContext}.
 */
export interface GetEditorContextOptions {
  /**
   * Custom schema awareness items to include in addition to the default ones.
   *
   * This lets callers extend the serialized editor context with custom node
   * definitions or overrides.
   * @default []
   */
  customNodes?: JsonItem[]
}

/**
 * Returns editor context data including a serialized schema and merged custom nodes.
 *
 * This function collects schema information from extensions and converts it to a format
 * suitable for AI model consumption. Zod schemas in attributes are converted to JSON schemas.
 *
 * @param editor - The Tiptap editor instance
 * @param options - Configuration options for the editor context
 * @return An object containing the serialized schema and merged custom nodes with JSON schema attributes
 */
export function getEditorContext(
  editor: Editor,
  options: GetEditorContextOptions = {},
): EditorContext {
  const extensionNamesSet = new Set(editor.extensionManager.extensions.map(ext => ext.name))

  const customNodesFromExtensions = editor.extensionManager.extensions.flatMap(extension => {
    const context = {
      name: extension.name,
      options: extension.options,
      storage: extension.storage,
      editor,
    }
    const addJsonSchemaAwareness = getExtensionField<AddJsonSchemaAwareness>(
      extension,
      'addJsonSchemaAwareness',
      context,
    )
    if (addJsonSchemaAwareness) {
      return {
        ...addJsonSchemaAwareness(),
        isMark: extension instanceof Mark,
        extensionName: extension.name,
      }
    }
    return []
  })

  const items = [defaultJsonItems, customNodesFromExtensions, options.customNodes ?? []]
    .reduce(mergeJsonItems, [])
    .filter((item: JsonItem) => extensionNamesSet.has(item.extensionName))

  // Convert Zod schemas to JSON schemas
  const mergedCustomNodes = items.map((item: JsonItem) => {
    const { attributes, ...rest } = item
    if (!attributes) {
      return rest
    }

    const attributesSchema = z.object(attributes)
    const jsonSchema = z.toJSONSchema(attributesSchema)

    return {
      ...rest,
      attributes: jsonSchema,
    }
  })

  return {
    serializedSchema: serializeSchema(editor.schema),
    items: mergedCustomNodes,
  }
}
