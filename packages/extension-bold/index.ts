import { Mark } from '@tiptap/core'
import { toggleMark } from 'prosemirror-commands'

export default class Bold extends Mark {

  name = 'bold'

  created() {
    this.editor.registerCommand('bold', (next, { view }) => {
      toggleMark(this.schemaType)(view.state, view.dispatch)
      next()
    })
  }

  schema() {
    return {
      parseDOM: [
        {
          tag: 'strong',
        },
        {
          tag: 'b',
          getAttrs: (node: HTMLElement) => node.style.fontWeight !== 'normal' && null,
        },
        // {
        //   style: 'font-weight',
        //   getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
        // },
      ],
      toDOM: () => ['strong', 0],
    }
  }

}