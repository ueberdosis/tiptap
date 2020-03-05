import { Node } from '@tiptap/core'

export default class Document extends Node {

  name = 'doc'

  schema = {
    content: 'block+',
  }

}