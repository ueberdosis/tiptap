import Vue from 'vue'
import VueCompositionAPI, { defineComponent, h } from '@vue/composition-api'

Vue.use(VueCompositionAPI)
export const NodeViewContent = defineComponent({
  props: {
    as: {
      type: String,
      default: 'div',
    },
  },

  render() {
    return h(
      // @ts-ignore
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
})
