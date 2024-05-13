import {
  DOMParser,
  Fragment,
  Node as ProseMirrorNode,
  ParseOptions,
  Schema,
} from '@tiptap/pm/model'

import { Content } from '../types.js'
import { elementFromString } from '../utilities/elementFromString.js'

export type CreateNodeFromContentOptions = {
  slice?: boolean
  parseOptions?: ParseOptions
}

/**
 * Takes a JSON or HTML content and creates a Prosemirror node or fragment from it.
 * @param content The JSON or HTML content to create the node from
 * @param schema The Prosemirror schema to use for the node
 * @param options Options for the parser
 * @returns The created Prosemirror node or fragment
 */
export function createNodeFromContent(
  content: Content,
  schema: Schema,
  options?: CreateNodeFromContentOptions,
): ProseMirrorNode | Fragment {
  options = {
    slice: true,
    parseOptions: {},
    ...options,
  }

  const isJSONContent = typeof content === 'object' && content !== null
  const isTextContent = typeof content === 'string'

  if (isJSONContent) {
    try {
      const isArrayContent = Array.isArray(content) && content.length > 0

      // if the JSON Content is an array of nodes, create a fragment for each node
      if (isArrayContent) {
        return Fragment.fromArray(content.map(item => schema.nodeFromJSON(item)))
      }

      return schema.nodeFromJSON(content)
    } catch (error) {
      console.warn('[tiptap warn]: Invalid content.', 'Passed value:', content, 'Error:', error)

      return createNodeFromContent('', schema, options)
    }
  }

  if (isTextContent) {
    const parser = DOMParser.fromSchema(schema)

    return options.slice
      ? parser.parseSlice(elementFromString(content), options.parseOptions).content
      : parser.parse(elementFromString(content), options.parseOptions)
  }

  return createNodeFromContent('', schema, options)
}
