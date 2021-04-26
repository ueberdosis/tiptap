import { Schema, Node as ProseMirrorNode, ParseOptions } from 'prosemirror-model'
import { Content } from '../types'
import createNodeFromContent from './createNodeFromContent'

export default function createDocument(
  content: Content,
  schema: Schema,
  parseOptions: ParseOptions = {},
): ProseMirrorNode {
  return createNodeFromContent(content, schema, { slice: false, parseOptions }) as ProseMirrorNode
}
