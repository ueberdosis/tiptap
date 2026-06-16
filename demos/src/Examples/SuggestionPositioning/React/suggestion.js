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
    let cleanup = null

    return {
      onStart: props => {
        component = new ReactRenderer(DropdownList, {
          props,
          editor: props.editor,
        })

        document.body.appendChild(component.element)
        cleanup = props.autoPosition(component.element)
      },

      onUpdate(props) {
        component.updateProps(props)
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
        cleanup?.()
        component.element.remove()
        component.destroy()
      },
    }
  },
}
