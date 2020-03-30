import { Node } from '@tiptap/core'

export default class Text extends Node {

  name = 'text'

  schema() {
    return {
      group: 'inline',
    }
  }

}