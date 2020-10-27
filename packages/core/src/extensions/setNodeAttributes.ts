import { Command } from '../Editor'
import { createExtension } from '../Extension'

export const SetNodeAttributes = createExtension({
  addCommands() {
    return {
      setNodeAttributes: (attributes: {}): Command => ({ tr, state }) => {
        const { selection } = tr
        const { from, to } = selection

        state.doc.nodesBetween(from, to, (node, pos) => {
          if (!node.type.isText) {
            tr.setNodeMarkup(pos, undefined, attributes)
          }
        })

        return true
      },
    }
  },
})

declare module '../Editor' {
  interface AllExtensions {
    SetNodeAttributes: typeof SetNodeAttributes,
  }
}
