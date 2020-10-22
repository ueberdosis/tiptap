import Node from '../../../../../packages/tiptap/src/Utils/Node'
import toggleWrap from '../../../../../packages/tiptap-commands/src/commands/toggleWrap'

export default function (component) {
  return class extends Node {
    get name() {
      return 'staffmember'
    }

    get schema() {
      return {
        content: 'staffmemberdefaultblockslot',
        attrs: {
          name: {},
        },
        selectable: true,
        draggable: true,
        parseDOM: [{
          tag: 'staff-member',
          getAttrs: dom => ({
            name: dom.getAttribute('name'),
          }),
        }],
        toDOM: node => ['staff-member', node.attrs, 0],
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
