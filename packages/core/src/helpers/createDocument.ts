import type { Fragment, Node as ProseMirrorNode, ParseOptions, Schema } from '@tiptap/pm/model'

import type { BrowserEnvironmentManager } from '../BrowserEnvironment.js'
import type { Content } from '../types.js'
import { createNodeFromContent } from './createNodeFromContent.js'

/**
 * Create a new Prosemirror document node from content.
 * @param content The JSON or HTML content to create the document from
 * @param schema The Prosemirror schema to use for the document
 * @param parseOptions Options for the parser
 * @param options Additional options including browser environment
 * @returns The created Prosemirror document node
 */
export function createDocument(
  content: Content | ProseMirrorNode | Fragment,
  schema: Schema,
  parseOptions: ParseOptions = {},
  options: { errorOnInvalidContent?: boolean; browserEnv?: BrowserEnvironmentManager } = {},
): ProseMirrorNode {
  return createNodeFromContent(content, schema, {
    slice: false,
    parseOptions,
    errorOnInvalidContent: options.errorOnInvalidContent,
    browserEnv: options.browserEnv,
  }) as ProseMirrorNode
}
