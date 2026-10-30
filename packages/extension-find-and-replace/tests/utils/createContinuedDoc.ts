import type { JSONContent } from '@tiptap/core'
import { getSchema } from '@tiptap/core'
import Blockquote from '@tiptap/extension-blockquote'
import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
import Text from '@tiptap/extension-text'
import type { Node as PMNode } from '@tiptap/pm/model'

import { ContinuedParagraph } from './ContinuedParagraph.js'

const schema = getSchema([Document, ContinuedParagraph, Text, HardBreak, Blockquote])

export function paragraph(text: string, continued = false): JSONContent {
  return { type: 'paragraph', attrs: { continued }, content: [{ type: 'text', text }] }
}

export function createContinuedDoc(paragraphs: JSONContent[]): PMNode {
  return schema.nodeFromJSON({ type: 'doc', content: paragraphs })
}

export function continuesNode(node: PMNode): boolean {
  return node.attrs.continued === true
}
