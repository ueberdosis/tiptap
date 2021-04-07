import {
  Schema,
  DOMParser,
  Node as ProseMirrorNode,
  Fragment,
} from 'prosemirror-model'
import elementFromString from '../utilities/elementFromString'
import { AnyObject } from '../types'

export type Content = string | JSON | null

export type CreateNodeFromContentOptions = {
  slice?: boolean,
  parseOptions?: AnyObject,
}

export default function createNodeFromContent(
  content: Content,
  schema: Schema,
  options?: CreateNodeFromContentOptions,
): string | ProseMirrorNode | Fragment {
  options = {
    slice: true,
    parseOptions: {},
    ...options,
  }

  if (content && typeof content === 'object') {
    try {
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
    const isHTML = content.trim().startsWith('<') && content.trim().endsWith('>')

    if (isHTML || !options.slice) {
      const parser = DOMParser.fromSchema(schema)

      return options.slice
        ? parser.parseSlice(elementFromString(content), options.parseOptions).content
        : parser.parse(elementFromString(content), options.parseOptions)
    }

    return content
  }

  return createNodeFromContent('', schema, options)
}
