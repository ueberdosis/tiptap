import { ReactRenderer } from '@tiptap/react'

import { updatePosition } from '../../../utils/updatePosition.js'
import { EmojiList } from './EmojiList.jsx'

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

  allowSpaces: false,

  render: () => {
    let component

    function repositionComponent(editor) {
      updatePosition({
        editor,
        element: component?.element,
        placement: 'bottom-start',
        strategy: 'absolute',
        middleware: [],
      })
    }

    return {
      onStart: props => {
        component = new ReactRenderer(EmojiList, {
          props,
          editor: props.editor,
        })

        document.body.appendChild(component.element)
        repositionComponent(props.editor)
      },

      onUpdate(props) {
        component.updateProps(props)
        repositionComponent(props.editor)
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
