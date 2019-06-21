import { Doc } from 'tiptap'

export default class CustomDoc extends Doc {

  get schema() {
    return {
      content: 'title block+',
    }
  }

}
