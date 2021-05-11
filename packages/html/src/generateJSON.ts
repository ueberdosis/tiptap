import { DOMParser } from 'prosemirror-model'
import { getSchema, Extensions } from '@tiptap/core'
// @ts-ignore
import { parseHTML } from 'hostic-dom'

export default function generateJSON(html: string, extensions: Extensions): Record<string, any> {
  const schema = getSchema(extensions)
  const dom = parseHTML(html)

  return DOMParser.fromSchema(schema)
    .parse(dom)
    .toJSON()
}
