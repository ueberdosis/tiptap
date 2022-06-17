import { DOMParser } from 'prosemirror-model'

import { Extensions } from '../types'
import { elementFromString } from '../utilities/elementFromString'
import { getSchema } from './getSchema'

export function generateJSON(html: string, extensions: Extensions): Record<string, any> {
  const schema = getSchema(extensions)
  const dom = elementFromString(html)

  return DOMParser.fromSchema(schema)
    .parse(dom)
    .toJSON()
}
