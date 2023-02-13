import { Node as ProseMirrorNode, ParseOptions, Schema } from '@tiptap/pm/model'

import { Content } from '../types'
import { createNodeFromContent } from './createNodeFromContent'

export function createDocument(
  content: Content,
  schema: Schema,
  parseOptions: ParseOptions = {},
): ProseMirrorNode {
  return createNodeFromContent(content, schema, { slice: false, parseOptions }) as ProseMirrorNode
}
