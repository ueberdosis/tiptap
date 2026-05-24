import { computePosition, flip as floatingFlip } from '@floating-ui/dom'
import { VueRenderer } from '@tiptap/vue-3'

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
  items: ({ query }) => items.filter(item => item.label.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5),

  placement: 'top-start',

  offset: { mainAxis: 8 },

  flip: true,

  render: () => {
    let component

    function reposition(props) {
      if (!props.clientRect || !component?.element) {
        return
      }

      const virtualElement = {
        getBoundingClientRect: () => props.clientRect(),
      }

      const { placement, offset: offsetOption, flip } = props

      const middleware = []

      if (flip) {
        middleware.push(floatingFlip())
      }

      computePosition(virtualElement, component.element, {
        placement,
        strategy: 'absolute',
        middleware,
      }).then(({ x, y, strategy }) => {
        const offsetX = offsetOption?.mainAxis ?? 0
        const offsetY = offsetOption?.crossAxis ?? 0

        Object.assign(component.element.style, {
          left: `${x + offsetX}px`,
          top: `${y + offsetY}px`,
          position: strategy === 'fixed' ? 'fixed' : 'absolute',
          width: 'max-content',
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

        if (!props.clientRect) {
          return
        }

        document.body.appendChild(component.element)
        reposition(props)
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
        component.element.remove()
        component.destroy()
      },
    }
  },
}
