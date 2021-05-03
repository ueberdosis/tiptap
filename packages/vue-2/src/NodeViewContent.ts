import Vue, { Component } from 'vue'

interface NodeViewContentInterface extends Vue {
  as: string
}

export const NodeViewContent: Component = {
  props: {
    as: {
      type: String,
      default: 'div',
    },
  },

  render(this: NodeViewContentInterface, createElement) {
    return createElement(
      this.as, {
        style: {
          whiteSpace: 'pre-wrap',
        },
        attrs: {
          'data-node-view-content': '',
        },
      },
    )
  },
}
