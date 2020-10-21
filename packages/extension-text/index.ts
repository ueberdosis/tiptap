import { createNode } from '@tiptap/core'

// export default new Node()
//   .name('text')
//   .schema(() => ({
//     group: 'inline',
//   }))
//   .create()

// export default class Text extends Node {

//   name = 'text'

//   group = 'inline'

// }

export default createNode({
  name: 'text',

  group: 'inline',
})
