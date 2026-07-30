import { flip, shift } from '@floating-ui/dom'
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
  items: ({ query }) =>
    items.filter(item => item.label.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5),

  placement: 'top-start',

  offset: { mainAxis: 8 },

  flip: false,

  floatingUi: {
    strategy: 'fixed',
    middleware: [flip({ padding: 8 }), shift({ padding: 8 })],
  },

  // Dismiss the popup when clicking outside it (and outside the editor).
  dismissOnOutsideClick: true,

  render: () => {
    let component
    let unmount = null

    return {
      onStart: props => {
        if (component) {
          component.destroy()
        }

        component = new VueRenderer(DropdownList, {
          props,
          editor: props.editor,
        })

        // Managed positioning: the plugin mounts the element into the container,
        // keeps it anchored to the cursor, and repositions it on scroll/resize.
        unmount = props.mount(component.element)
      },

      onUpdate(props) {
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
        unmount?.()
        component.destroy()
      },
    }
  },
}
