import type { Range, RawCommands } from '../types.js'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    unsetTextDirection: {
      /**
       * Remove the text direction attribute from nodes.
       * If no position is provided, it will use the current selection.
       * @param position Optional position or range to remove the direction from
       * @example editor.commands.unsetTextDirection()
       * @example editor.commands.unsetTextDirection({ from: 0, to: 10 })
       */
      unsetTextDirection: (position?: number | Range) => ReturnType
    }
  }
}

export const unsetTextDirection: RawCommands['unsetTextDirection'] =
  position =>
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

        const newAttrs = { ...node.attrs }

        delete newAttrs.dir

        tr.setNodeMarkup(pos, undefined, newAttrs)
      })
    }

    return true
  }
