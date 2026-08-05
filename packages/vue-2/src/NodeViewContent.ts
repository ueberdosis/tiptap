import type { Component, CreateElement } from 'vue'
import type Vue from 'vue'

/**
 * The instance type of `NodeViewContent`.
 */
export interface NodeViewContentInterface extends Vue {
  as: string
}

/**
 * Marks where the editable content of a node view goes.
 */
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
