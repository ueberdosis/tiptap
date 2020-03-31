import { Node } from '@tiptap/core'
import { NodeSpec } from 'prosemirror-model'

export default class Text extends Node {

  name = 'text'

  schema(): NodeSpec {
    return {
      group: 'inline',
    }
  }

}