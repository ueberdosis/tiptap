import Node from '../../../../../packages/tiptap/src/Utils/Node'

export default class extends Node {
  get name() {
    return 'staffmemberslot'
  }

  get schema() {
    return {
      content: 'staffmember*',
      attrs: {
        'v-slot:staff-members': { default: 'slotProps' },
      },
      selectable: false,
      draggable: false,
      parseDOM: [{
        tag: 'template[v-slot:staff-members]',
        getAttrs: dom => ({
          'v-slot:staff-members': dom.getAttribute('v-slot:staff-members'),
        }),
      }],
      toDOM: node => ['template', node.attrs, 0],
    }
  }
}
