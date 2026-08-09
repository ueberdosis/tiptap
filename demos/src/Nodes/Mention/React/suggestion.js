import { ReactRenderer } from '@tiptap/react'

import { updatePosition } from '../../../utils/updatePosition.js'
import MentionList from './MentionList.jsx'

const allItems = [
  'Lea Thompson',
  'Cyndi Lauper',
  'Tom Cruise',
  'Madonna',
  'Jerry Hall',
  'Joan Collins',
  'Winona Ryder',
  'Christina Applegate',
  'Alyssa Milano',
  'Molly Ringwald',
  'Ally Sheedy',
  'Debbie Harry',
  'Olivia Newton-John',
  'Elton John',
  'Michael J. Fox',
  'Axl Rose',
  'Emilio Estevez',
  'Ralph Macchio',
  'Rob Lowe',
  'Jennifer Grey',
  'Mickey Rourke',
  'John Cusack',
  'Matthew Broderick',
  'Justine Bateman',
  'Lisa Bonet',
]

export default {
  items: async ({ query, signal }) => {
    // Simulate an async API call
    await new Promise(resolve => {
      setTimeout(resolve, 300)
    })

    // Bail out if the request was aborted (e.g. user kept typing or closed the popup)
    if (signal.aborted) {
      return []
    }

    // find items that include this character query
    return allItems.filter(item => item.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
  },

  minQueryLength: 2,

  debounce: 300,

  initialItems: ['Lea Thompson', 'Cyndi Lauper', 'Tom Cruise'],

  render: () => {
    let component

    return {
      onStart: props => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        component.element.style.position = 'absolute'

        document.body.appendChild(component.element)

        updatePosition({ editor: props.editor, element: component.element })
      },

      onUpdate(props) {
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        updatePosition({ editor: props.editor, element: component.element })
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          component.destroy()

          return true
        }

        return component.ref?.onKeyDown(props)
      },

      onExit() {
        component.element.remove()
        component.destroy()
      },
    }
  },
}
