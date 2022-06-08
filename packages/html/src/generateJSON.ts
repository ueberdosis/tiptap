import { Extensions, getSchema } from '@tiptap/core'
import { DOMParser } from 'prosemirror-model'
import { parseHTML } from 'zeed-dom'

export function generateJSON(html: string, extensions: Extensions): Record<string, any> {
  const schema = getSchema(extensions)
  const dom = parseHTML(html) as unknown as Node

  return DOMParser.fromSchema(schema)
    .parse(dom)
    .toJSON()
}
