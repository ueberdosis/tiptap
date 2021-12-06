import { Schema } from 'prosemirror-model'
import { TextSerializer } from '../types'

export function getTextSeralizersFromSchema(schema: Schema): Record<string, TextSerializer> {
  return Object.fromEntries(Object
    .entries(schema.nodes)
    .filter(([, node]) => node.spec.toText)
    .map(([name, node]) => [name, node.spec.toText]))
}
