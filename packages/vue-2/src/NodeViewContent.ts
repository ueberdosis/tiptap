import type { Component, CreateElement } from 'vue'
import type Vue from 'vue'

export interface NodeViewContentInterface extends Vue {
  as: string
}

export const NodeViewContent: Component = {
  props: {
    as: {
      type: String,
      default: 'div',
    },
  },

  inject: {
    nodeViewContentRef: { default: undefined },
  },

  mounted(this: any) {
    if (this.nodeViewContentRef && this.$el) {
      this.nodeViewContentRef(this.$el)
    }
  },

  beforeDestroy(this: any) {
    if (this.nodeViewContentRef) {
      this.nodeViewContentRef(null)
    }
  },

  render(this: NodeViewContentInterface, createElement: CreateElement) {
    return createElement(this.as, {
      style: {
        whiteSpace: 'pre-wrap',
      },
      attrs: {
        'data-node-view-content': '',
      },
    })
  },
}
