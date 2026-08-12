import { defineComponent, h } from 'vue'

export const NodeViewContent = defineComponent({
  name: 'NodeViewContent',

  props: {
    as: {
      type: String,
      default: 'div',
    },
  },

  inject: {
    nodeViewContentRef: { default: undefined },
  },

  mounted() {
    const ref = (this as any).nodeViewContentRef as ((el: HTMLElement | null) => void) | undefined
    if (ref && this.$el) {
      ref(this.$el)
    }
  },

  beforeUnmount() {
    const ref = (this as any).nodeViewContentRef as ((el: HTMLElement | null) => void) | undefined
    if (ref) {
      ref(null)
    }
  },

  render() {
    return h(this.as, {
      style: {
        whiteSpace: 'pre-wrap',
      },
      'data-node-view-content': '',
    })
  },
})
