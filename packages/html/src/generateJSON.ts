import { DOMParser } from 'prosemirror-model'
import { getSchema, Extensions } from '@tiptap/core'
import { parseHTML } from 'zeed-dom'

export default function generateJSON(html: string, extensions: Extensions): Record<string, any> {
  const schema = getSchema(extensions)
  const dom = parseHTML(html) as unknown as Node

  return DOMParser.fromSchema(schema)
    .parse(dom)
    .toJSON()
}
