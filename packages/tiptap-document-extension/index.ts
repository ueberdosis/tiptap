import { Node } from '@tiptap/core'

export default class Document extends Node {

  name = 'document'

  schema = {
    content: 'block+',
  }

}