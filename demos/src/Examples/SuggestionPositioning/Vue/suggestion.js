import { flip, shift } from '@floating-ui/dom'
import { VueRenderer } from '@tiptap/vue-3'

import { updatePosition } from '../../../utils/updatePosition.js'
import DropdownList from './DropdownList.vue'

const items = [
  { id: 'alice', label: 'Alice Johnson' },
  { id: 'bob', label: 'Bob Smith' },
  { id: 'carol', label: 'Carol Williams' },
  { id: 'dave', label: 'Dave Brown' },
  { id: 'eve', label: 'Eve Davis' },
  { id: 'frank', label: 'Frank Miller' },
  { id: 'grace', label: 'Grace Wilson' },
  { id: 'hank', label: 'Hank Moore' },
  { id: 'iris', label: 'Iris Taylor' },
  { id: 'jack', label: 'Jack Anderson' },
]

export default {
  items: ({ query }) =>
    items.filter(item => item.label.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5),

  placement: 'top-start',

  offset: { mainAxis: 8 },

  flip: false,

  floatingUi: {
    strategy: 'fixed',
    middleware: [flip({ padding: 8 }), shift({ padding: 8 })],
  },

  render: () => {
    let component
    let rafId = 0

    function reposition(props, { hideBeforeMeasure = false } = {}) {
      if (!props.editor || !component?.element) {
        return
      }

      cancelAnimationFrame(rafId)

      if (hideBeforeMeasure) {
        Object.assign(component.element.style, {
          left: '0px',
          top: '0px',
          position: props.floatingUi.strategy,
          visibility: 'hidden',
          width: 'max-content',
        })
      }

      rafId = requestAnimationFrame(() => {
        updatePosition({
          editor: props.editor,
          element: component.element,
          placement: props.floatingUi.placement,
          strategy: props.floatingUi.strategy,
          middleware: props.floatingUi.middleware,
        }).then(() => {
          Object.assign(component.element.style, {
            visibility: 'visible',
          })
        })
      })
    }

    return {
      onStart: props => {
        if (component) {
          component.destroy()
        }

        component = new VueRenderer(DropdownList, {
          props,
          editor: props.editor,
        })

        Object.assign(component.element.style, {
          left: '0px',
          top: '0px',
          position: props.floatingUi.strategy,
          visibility: 'hidden',
          width: 'max-content',
        })

        document.body.appendChild(component.element)
        reposition(props, { hideBeforeMeasure: true })
      },

      onUpdate(props) {
        component.updateProps(props)
        reposition(props)
      },

      onBeforeUpdate(props) {
        component.updateProps(props)
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          component.destroy()

          return true
        }

        return component.ref?.onKeyDown(props)
      },

      onExit() {
        cancelAnimationFrame(rafId)
        component.element.remove()
        component.destroy()
      },
    }
  },
}
