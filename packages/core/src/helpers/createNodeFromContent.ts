import {
  DOMParser,
  Fragment,
  Node as ProseMirrorNode,
  ParseOptions,
  Schema,
} from 'prosemirror-model'

import { Content } from '../types'
import { elementFromString } from '../utilities/elementFromString'

export type CreateNodeFromContentOptions = {
  slice?: boolean,
  parseOptions?: ParseOptions,
}

export function createNodeFromContent(
  content: Content,
  schema: Schema,
  options?: CreateNodeFromContentOptions,
): ProseMirrorNode | Fragment {
  options = {
    slice: true,
    parseOptions: {},
    ...options,
  }

  if (typeof content === 'object' && content !== null) {
    try {
      if (Array.isArray(content)) {
        return Fragment.fromArray(content.map(item => schema.nodeFromJSON(item)))
      }

      return schema.nodeFromJSON(content)
    } catch (error) {
      console.warn(
        '[tiptap warn]: Invalid content.',
        'Passed value:',
        content,
        'Error:',
        error,
      )

      return createNodeFromContent('', schema, options)
    }
  }

  if (typeof content === 'string') {
    const parser = DOMParser.fromSchema(schema)

    return options.slice
      ? parser.parseSlice(elementFromString(content), options.parseOptions).content
      : parser.parse(elementFromString(content), options.parseOptions)
  }

  return createNodeFromContent('', schema, options)
}
