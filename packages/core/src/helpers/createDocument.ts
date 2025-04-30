import type { Fragment, Node as ProseMirrorNode, ParseOptions, Schema } from '@tiptap/pm/model'

import type { Content } from '../types.js'
import { createNodeFromContent } from './createNodeFromContent.js'

/**
 * Create a new Prosemirror document node from content.
 * @param content The JSON or HTML content to create the document from
 * @param schema The Prosemirror schema to use for the document
 * @param parseOptions Options for the parser
 * @returns The created Prosemirror document node
 */
export function createDocument(
  content: Content | ProseMirrorNode | Fragment,
  schema: Schema,
  parseOptions: ParseOptions = {},
  options: { errorOnInvalidContent?: boolean } = {},
): ProseMirrorNode {
  return createNodeFromContent(content, schema, {
    slice: false,
    parseOptions,
    errorOnInvalidContent: options.errorOnInvalidContent,
  }) as ProseMirrorNode
}
