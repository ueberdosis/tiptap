import { Schema, Node as ProseMirrorNode } from 'prosemirror-model'
import { AnyObject } from '../types'
import createNodeFromContent from './createNodeFromContent'

export type Content = string | JSON | null

export default function createDocument(
  content: Content,
  schema: Schema,
  parseOptions: AnyObject = {},
): ProseMirrorNode {
  return createNodeFromContent(content, schema, { slice: false, parseOptions }) as ProseMirrorNode
}
