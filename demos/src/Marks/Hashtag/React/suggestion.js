import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'

import HashtagList from './HashtagList.jsx'

let component
const suggestion = {
  items: async ({ query }) => {
    return [
      'MahsaAmini',
      'deadpool3',
      'BeUnstopable',
      'Samsung',
      'Apple',
      'Hamburg',
    ]
      .filter(item => item.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, 5)
  },
  render: () => {
    let popup

    return {
      onBeforeStart: props => {
        component = new ReactRenderer(HashtagList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        })
      },
      onStart: props => {
        component.updateProps(props)
      },
      onBeforeUpdate(props) {
        component.updateProps(props)
      },
      onUpdate(props) {
        component.updateProps(props)
        if (!props.clientRect) {
          return
        }
        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          popup[0].hide()
          return true
        }

        return component.ref?.onKeyDown(props)
      },
      onExit() {
        popup[0].destroy()
        component.destroy()
      },
    }
  },
}

export default suggestion
