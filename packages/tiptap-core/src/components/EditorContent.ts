import Vue from 'vue'

export default Vue.extend({
  props: {
    editor: {
      default: null,
      type: Object,
    },
  },

  watch: {
    editor: {
      immediate: true,
      handler(editor) {
        if (editor && editor.element) {
          this.$nextTick(() => {
            this.$el.appendChild(editor.element.firstChild)
            // editor.setParentComponent(this)
          })
        }
      },
    },
  },

  render(createElement) {
    return createElement('div')
  },

  beforeDestroy() {
    this.editor.element = this.$el
  },
})
