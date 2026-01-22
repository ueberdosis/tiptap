import { computePosition } from '@floating-ui/dom'
import { VueRenderer } from '@dibdab/vue-3'

import EmojiList from './EmojiList.vue'

export default {
  items: ({ editor, query }) => {
    return editor.storage.emoji.emojis
      .filter(({ shortcodes, tags }) => {
        return (
          shortcodes.find(shortcode => shortcode.startsWith(query.toLowerCase())) ||
          tags.find(tag => tag.startsWith(query.toLowerCase()))
        )
      })
      .slice(0, 5)
  },

  render: () => {
    let component

    function repositionComponent(clientRect) {
      if (!component || !component.element) {
        return
      }

      const virtualElement = {
        getBoundingClientRect() {
          return clientRect
        },
      }

      computePosition(virtualElement, component.element, {
        placement: 'bottom-start',
      }).then(pos => {
        Object.assign(component.element.style, {
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          position: pos.strategy === 'fixed' ? 'fixed' : 'absolute',
        })
      })
    }

    return {
      onStart: props => {
        component = new VueRenderer(EmojiList, {
          props,
          editor: props.editor,
        })

        document.body.appendChild(component.element)
        repositionComponent(props.clientRect())
      },

      onUpdate(props) {
        component.updateProps(props)
        repositionComponent(props.clientRect())
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          document.body.removeChild(component.element)
          component.destroy()

          return true
        }

        return component.ref?.onKeyDown(props)
      },

      onExit() {
        if (document.body.contains(component.element)) {
          document.body.removeChild(component.element)
        }
        component.destroy()
      },
    }
  },
}
