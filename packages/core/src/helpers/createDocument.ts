import type { Fragment, Node as ProseMirrorNode, ParseOptions, Schema } from '@tiptap/pm/model'

import type { MarkdownManager } from '../markdown/MarkdownManager.js'
import type { Content, ContentType } from '../types.js'
import { parseContentByType } from './parseContentByType.js'

/**
 * Create a new Prosemirror document node from content.
 * @param content The JSON, HTML, or Markdown content to create the document from
 * @param schema The Prosemirror schema to use for the document
 * @param parseOptions Options for the parser
 * @param options Additional options including content type and error handling
 * @returns The created Prosemirror document node
 */
export function createDocument(
  content: Content | ProseMirrorNode | Fragment,
  schema: Schema,
  parseOptions: ParseOptions = {},
  options: {
    errorOnInvalidContent?: boolean
    contentType?: ContentType
    markdownManager?: MarkdownManager
  } = {},
): ProseMirrorNode {
  return parseContentByType(content, schema, options.contentType, options.markdownManager, {
    slice: false,
    parseOptions,
    errorOnInvalidContent: options.errorOnInvalidContent,
  }) as ProseMirrorNode
}
