import MenuBubble from '../Plugins/MenuBubble'

export default {

  props: {
    editor: {
      default: null,
      type: Object,
    },
    keepInBounds: {
      default: true,
      type: Boolean,
    },
  },

  data() {
    return {
      menu: {
        isActive: false,
        left: 0,
        bottom: 0,
      },
    }
  },

  watch: {
    editor: {
      immediate: true,
      handler(editor) {
        if (editor) {
          this.$nextTick(() => {
            editor.registerPlugin(MenuBubble({
              editor,
              element: this.$el,
              keepInBounds: this.keepInBounds,
              onUpdate: menu => {
                // the second check ensures event is fired only once
                if (menu.isActive && this.menu.isActive === false) {
                  this.$emit('show', menu)
                } else if (!menu.isActive && this.menu.isActive === true) {
                  this.$emit('hide', menu)
                }
                this.menu = menu
              },
            }))
          })
        }
      },
    },
  },

  render() {
    if (!this.editor) {
      return null
    }

    return this.$scopedSlots.default({
      focused: this.editor.view.focused,
      focus: this.editor.focus,
      commands: this.editor.commands,
      isActive: this.editor.isActive,
      getMarkAttrs: this.editor.getMarkAttrs.bind(this.editor),
      getNodeAttrs: this.editor.getNodeAttrs.bind(this.editor),
      menu: this.menu,
    })
  },

  beforeDestroy() {
    this.editor.unregisterPlugin('menu_bubble')
  },

}
