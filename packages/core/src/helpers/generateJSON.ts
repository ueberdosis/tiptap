import { DOMParser } from '@tiptap/pm/model'

import { Extensions } from '../types.js'
import { elementFromString } from '../utilities/elementFromString.js'
import { getSchema } from './getSchema.js'

export function generateJSON(html: string, extensions: Extensions): Record<string, any> {
  const schema = getSchema(extensions)
  const dom = elementFromString(html)

  return DOMParser.fromSchema(schema).parse(dom).toJSON()
}
