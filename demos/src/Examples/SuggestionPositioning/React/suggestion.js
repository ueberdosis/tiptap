import { computePosition, flip as floatingFlip } from '@floating-ui/dom'
import { ReactRenderer } from '@tiptap/react'

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

function reposition(props, element) {
  if (!props.clientRect) {
    return
  }

  const virtualElement = {
    getBoundingClientRect: () => props.clientRect(),
  }

  const { placement, offset: offsetOption, flip } = props

  // Build Floating UI middleware from the suggestion props
  const middleware = []

  if (flip) {
    middleware.push(floatingFlip())
  }

  computePosition(virtualElement, element, {
    placement,
    strategy: 'absolute',
    middleware,
  }).then(({ x, y, strategy }) => {
    // Apply offset manually since we don't always add offset middleware
    const offsetX = offsetOption?.mainAxis ?? 0
    const offsetY = offsetOption?.crossAxis ?? 0

    Object.assign(element.style, {
      left: `${x + offsetX}px`,
      top: `${y + offsetY}px`,
      position: strategy === 'fixed' ? 'fixed' : 'absolute',
      width: 'max-content',
    })
  })
}

export default {
  items: ({ query }) => items.filter(item => item.label.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5),

  placement: 'top-start',

  offset: { mainAxis: 8 },

  flip: true,

  render: () => {
    let component

    return {
      onStart: props => {
        component = new ReactRenderer(DropdownList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        document.body.appendChild(component.element)

        reposition(props, component.element)
      },

      onUpdate(props) {
        component.updateProps(props)
        reposition(props, component.element)
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
        component.element.remove()
        component.destroy()
      },
    }
  },
}
