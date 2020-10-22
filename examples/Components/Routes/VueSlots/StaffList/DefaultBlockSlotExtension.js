import Node from '../../../../../packages/tiptap/src/Utils/Node'

export default class extends Node {
  get name() {
    return 'stafflistdefaultblockslot'
  }

  get schema() {
    return {
      content: 'block*',
      group: 'block',
      attrs: {
        'v-slot:default': { default: 'slotProps' },
      },
      selectable: false,
      draggable: false,
      parseDOM: [{
        tag: 'template[v-slot:default]',
        getAttrs: dom => ({
          'v-slot:default': dom.getAttribute('v-slot:default'),
        }),
      }],
      toDOM: node => ['template', node.attrs, 0],
    }
  }
}
