import { DOMParser } from 'prosemirror-model'
import { getSchema } from './getSchema'
import { elementFromString } from '../utilities/elementFromString'
import { Extensions } from '../types'

export function generateJSON(html: string, extensions: Extensions): Record<string, any> {
  const schema = getSchema(extensions)
  const dom = elementFromString(html)

  return DOMParser.fromSchema(schema)
    .parse(dom)
    .toJSON()
}
