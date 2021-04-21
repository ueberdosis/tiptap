import { Schema, Node as ProseMirrorNode } from 'prosemirror-model'
import { Content } from '../types'
import createNodeFromContent from './createNodeFromContent'

export default function createDocument(
  content: Content,
  schema: Schema,
  parseOptions: Record<string, any> = {},
): ProseMirrorNode {
  return createNodeFromContent(content, schema, { slice: false, parseOptions }) as ProseMirrorNode
}
