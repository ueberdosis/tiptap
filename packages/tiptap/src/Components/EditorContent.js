export default {

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
        if (editor.element) {
          this.$nextTick(() => {
            this.$el.append(editor.element.firstChild)
            editor.setParentComponent(this)
          })
        }
      },
    },
  },

  render(createElement) {
    return createElement('div')
  },

}
