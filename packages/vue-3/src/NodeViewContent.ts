import { h, defineComponent } from 'vue'

export const NodeViewContent = defineComponent({
  props: {
    as: {
      type: String,
      default: 'div',
    },
  },

  inject: ['isEditable'],

  render() {
    return h(
      this.as, {
        style: {
          whiteSpace: 'pre-wrap',
        },
        'data-node-view-content': '',
        // @ts-ignore (https://github.com/vuejs/vue-next/issues/3031)
        contenteditable: this.isEditable.value,
      },
    )
  },
})
