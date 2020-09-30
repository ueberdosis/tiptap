import Vue from 'vue'

export default Vue.extend({
  name: 'EditorContent',

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
        if (editor && editor.options.element) {
          this.$nextTick(() => {
            this.$el.appendChild(editor.options.element.firstChild)
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
    this.editor.options.element = this.$el
  },
})
