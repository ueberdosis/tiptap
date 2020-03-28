import { Node } from '@tiptap/core'

export default class Document extends Node {

  name = 'document'

  topNode = true

  schema() {
    return {
      content: 'block+',
    }
  }

}