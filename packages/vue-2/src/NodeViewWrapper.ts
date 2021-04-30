import Vue from 'vue'
import VueCompositionAPI, { defineComponent, h } from '@vue/composition-api'

Vue.use(VueCompositionAPI)

export const NodeViewWrapper = defineComponent({
  props: {
    as: {
      type: String,
      default: 'div',
    },
  },

  inject: ['onDragStart', 'decorationClasses'],

  render() {
    return h(
      // @ts-ignore
      this.as, {
        // @ts-ignore
        class: this.decorationClasses.value,
        style: {
          whiteSpace: 'normal',
        },
        attrs: {
          'data-node-view-wrapper': '',
        },
        on: {
          // @ts-ignore
          dragstart: this.onDragStart,
        },
      },
      this.$slots.default,
    )
  },
})
