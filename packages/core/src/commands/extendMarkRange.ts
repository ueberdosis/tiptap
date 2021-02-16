import { TextSelection } from 'prosemirror-state'
import { MarkType } from 'prosemirror-model'
import { Command, Commands } from '../types'
import getMarkType from '../helpers/getMarkType'
import getMarkRange from '../helpers/getMarkRange'

declare module '@tiptap/core' {
  interface AllCommands {
    extendMarkRange: {
      /**
       * Extends the text selection to the current mark.
       */
      extendMarkRange: (typeOrName: string | MarkType) => Command,
    }
  }
}

export const extendMarkRange: Commands['extendMarkRange'] = typeOrName => ({ tr, state, dispatch }) => {
  const type = getMarkType(typeOrName, state.schema)
  const { doc, selection } = tr
  const { $from, empty } = selection

  if (empty && dispatch) {
    const range = getMarkRange($from, type)

    if (range) {
      const newSelection = TextSelection.create(doc, range.from, range.to)

      tr.setSelection(newSelection)
    }
  }

  return true
}
