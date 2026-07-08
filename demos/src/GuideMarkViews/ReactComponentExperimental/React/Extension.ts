import { Mark, mergeAttributes } from '@tiptap/core'
import { markView } from '@tiptap/react-experimental'

import Component from './Component.jsx'

/**
 * Exactly like the legacy demo, the mark view is configured on the
 * extension — `markView()` registers a native-contract component.
 */
export default Mark.create({
  name: 'reactComponent',

  addAttributes() {
    return {
      'data-count': { default: 0 },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'react-component',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['react-component', mergeAttributes(HTMLAttributes)]
  },

  addMarkView() {
    return markView(Component)
  },
})
