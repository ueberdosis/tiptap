import type { Range, RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setTextDirection: {
      /**
       * Set the text direction for nodes.
       * If no position is provided, it will use the current selection.
       * @param direction The text direction to set ('ltr', 'rtl', or 'auto')
       * @param position Optional position or range to apply the direction to
       * @example editor.commands.setTextDirection('rtl')
       * @example editor.commands.setTextDirection('ltr', { from: 0, to: 10 })
       */
      setTextDirection: (direction: 'ltr' | 'rtl' | 'auto', position?: number | Range) => ReturnType
    }
  }
}

export const setTextDirection: RawCommands['setTextDirection'] =
  (direction, position) =>
  ({ tr, state, dispatch }) => {
    const { selection } = state
    let from: number
    let to: number

    if (typeof position === 'number') {
      from = position
      to = position
    } else if (position && 'from' in position && 'to' in position) {
      from = position.from
      to = position.to
    } else {
      from = selection.from
      to = selection.to
    }

    if (dispatch) {
      tr.doc.nodesBetween(from, to, (node, pos) => {
        if (node.isText) {
          return
        }

        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          dir: direction,
        })
      })
    }

    return true
  }
