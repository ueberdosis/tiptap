import Node from '../../../../../packages/tiptap/src/Utils/Node'
import toggleWrap from '../../../../../packages/tiptap-commands/src/commands/toggleWrap'

export default function (component) {
  return class extends Node {
    get name() {
      return 'stafflist'
    }

    get schema() {
      return {
        content: 'stafflistdefaultblockslot staffmemberslot',
        group: 'block',
        defining: true,
        selectable: true,
        draggable: true,
        parseDOM: [{
          tag: 'staff-list',
        }],
        toDOM: () => ['staff-list', 0],
      }
    }

    get view() {
      return component
    }

    commands({ type }) {
      return () => toggleWrap(type)
    }
  }
}
