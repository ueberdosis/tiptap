import { Node } from '@tiptap/core'

export default class Document extends Node {

  // get name() {
  //   return 'document'
  // }

  // get schema() {
  //   return {
  //     content: 'block+',
  //   }
  // }

  // type = 'nope'

  name = 'document'

  schema = {
    content: 'block+',
  }

}