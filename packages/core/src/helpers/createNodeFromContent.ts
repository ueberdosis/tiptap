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
  errorOnInvalidContent?: boolean
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
      if (options.errorOnInvalidContent) {
        throw new Error('[tiptap error]: Invalid JSON content', { cause: error as Error })
      }

      console.warn('[tiptap warn]: Invalid content.', 'Passed value:', content, 'Error:', error)

      return createNodeFromContent('', schema, options)
    }
  }

  if (isTextContent) {
    let schemaToUse = schema
    let hasInvalidContent = false

    // Only ever check for invalid content if we're supposed to throw an error
    if (options.errorOnInvalidContent) {
      schemaToUse = new Schema({
        topNode: schema.spec.topNode,
        marks: schema.spec.marks,
        // Prosemirror's schemas are executed such that: the last to execute, matches last
        // This means that we can add a catch-all node at the end of the schema to catch any content that we don't know how to handle
        nodes: schema.spec.nodes.append({
          __tiptap__private__unknown__catch__all__node: {
            content: 'inline*',
            group: 'block',
            parseDOM: [
              {
                tag: '*',
                getAttrs: () => {
                  // If this is ever called, we know that the content has something that we don't know how to handle in the schema
                  hasInvalidContent = true
                  return null
                },
              },
            ],
          },
        }),
      })
    }

    const parser = DOMParser.fromSchema(schemaToUse)

    const response = options.slice
      ? parser.parseSlice(elementFromString(content), options.parseOptions).content
      : parser.parse(elementFromString(content), options.parseOptions)

    if (options.errorOnInvalidContent && hasInvalidContent) {
      throw new Error('[tiptap error]: Invalid HTML content')
    }

    return response
  }

  return createNodeFromContent('', schema, options)
}
