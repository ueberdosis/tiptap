import { Node } from '@tiptap/core'
import { NodeSpec } from 'prosemirror-model'

export default class Document extends Node {

  name = 'document'

  topNode = true

  schema(): NodeSpec {
    return {
      content: 'block+',
    }
  }

}