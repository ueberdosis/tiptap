import {
  Schema,
  DOMParser,
  Node as ProseMirrorNode,
  Fragment,
  ParseOptions,
} from 'prosemirror-model'
import elementFromString from '../utilities/elementFromString'
import { Content } from '../types'

export type CreateNodeFromContentOptions = {
  slice?: boolean,
  parseOptions?: ParseOptions,
}

export default function createNodeFromContent(
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
