import { computePosition, flip, shift } from '@floating-ui/dom'
import { posToDOMRect, VueRenderer } from '@tiptap/vue-3'

import MentionList from './MentionList.vue'

const updatePosition = (editor, element) => {
  const virtualElement = {
    getBoundingClientRect: () =>
      posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to),
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

    return allItems.filter(item => item.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5)
  },

  minQueryLength: 2,

  debounce: 300,

  initialItems: ['Lea Thompson', 'Cyndi Lauper', 'Tom Cruise'],

  render: () => {
    let component

    return {
      onStart: props => {
        if (component) {
          component.destroy()
        }

        component = new VueRenderer(MentionList, {
          // using vue 2:
          // parent: this,
          // propsData: props,
          // using vue 3:
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

      onBeforeUpdate(props) {
        component.updateProps(props)
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
        component.element.remove()
        component.destroy()
      },
    }
  },
}
