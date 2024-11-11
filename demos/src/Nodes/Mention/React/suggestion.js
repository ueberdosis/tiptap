import { computePosition, flip, shift } from '@floating-ui/dom'
import { posToDOMRect, ReactRenderer } from '@tiptap/react'

import MentionList from './MentionList.jsx'

const updatePosition = (editor, element) => {
  const virtualElement = {
    getBoundingClientRect: () => posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to),
  }

  computePosition(virtualElement, element, {
    placement: 'bottom-start',
    strategy: 'absolute',
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }) => {
    element.style.width = 'max-content'
    element.style.position = strategy
    element.style.left = `${x}px`
    element.style.top = `${y}px`
  })
}

export default {
  items: ({ query }) => {
    return [
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
      .filter(item => item.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, 5)
  },

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

        updatePosition(props.editor, component.element)
      },

      onUpdate(props) {
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        updatePosition(props.editor, component.element)
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          component.destroy()

          return true
        }

        return component.ref?.onKeyDown(props)
      },

      onExit() {
        component.destroy()
      },
    }
  },
}
