import { flip, shift } from '@floating-ui/dom'
import { ReactRenderer } from '@tiptap/react'

import { updatePosition } from '../../../utils/updatePosition.js'
import DropdownList from './DropdownList.jsx'

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

function reposition(props, element, { hideBeforeMeasure = false } = {}) {
  if (!props.clientRect) {
    return
  }

  if (hideBeforeMeasure) {
    Object.assign(element.style, {
      left: '0px',
      top: '0px',
      visibility: 'hidden',
      width: 'max-content',
    })
  }

  requestAnimationFrame(() => {
    updatePosition({
      clientRect: props.clientRect(),
      element,
      placement: props.floatingUi.placement,
      strategy: props.floatingUi.strategy,
      middleware: props.floatingUi.middleware,
    }).then(() => {
      Object.assign(element.style, { visibility: 'visible' })
    })
  })
}

export default {
  items: ({ query }) => items.filter(item => item.label.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5),

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

    function scheduleReposition(props, hideBeforeMeasure = false) {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        reposition(props, component.element, { hideBeforeMeasure })
      })
    }

    return {
      onStart: props => {
        component = new ReactRenderer(DropdownList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        Object.assign(component.element.style, {
          left: '0px',
          top: '0px',
          position: props.floatingUi.strategy,
          visibility: 'hidden',
          width: 'max-content',
        })

        document.body.appendChild(component.element)

        scheduleReposition(props, true)
      },

      onUpdate(props) {
        component.updateProps(props)
        scheduleReposition(props)
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
