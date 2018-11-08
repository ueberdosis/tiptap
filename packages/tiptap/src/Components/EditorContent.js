export default {
  props: {
    editor: {
      default: null,
      type: Object,
    },
  },
  watch: {
    'editor.element': {
      immediate: true,
      handler(element) {
        if (element) {
          this.$nextTick(() => this.$el.append(element.firstChild))
        }
      },
    },
  },
  render(createElement) {
    return createElement('div')
  },
}
