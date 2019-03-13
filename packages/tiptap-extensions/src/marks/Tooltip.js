import { Mark, Plugin, TextSelection } from 'tiptap'
import { updateMark, removeMark, pasteRule } from 'tiptap-commands'
import { getMarkRange } from 'tiptap-utils'

export default class Tooltip extends Mark {
  get name() {
    return 'tooltip'
  }

  get schema() {
    return {
      attrs: {
        tooltip: {
          default: null,
        },
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'span[tooltip]',
          getAttrs: dom => ({
            tooltip: dom.getAttribute('tooltip'),
          }),
        },
      ],
      toDOM: node => ['span', {
        ...node.attrs
      }, 0],
    }
  }

  commands({ type }) {
    return attrs => {
      if (attrs.tooltip) {
        return updateMark(type, attrs)
      }

      return removeMark(type)
    }
  }

  pasteRules({ type }) {
    return [
      pasteRule(
        /.+/g,
        type,
        content => ({ tooltip: content }),
      ),
    ]
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          handleClick(view, pos) {
            const { schema, doc, tr } = view.state
            const range = getMarkRange(doc.resolve(pos), schema.marks.tooltip)

            if (!range) {
              return
            }

            const $start = doc.resolve(range.from)
            const $end = doc.resolve(range.to)
            const transaction = tr.setSelection(new TextSelection($start, $end))

            view.dispatch(transaction)
          },
        },
      }),
    ]
  }

}