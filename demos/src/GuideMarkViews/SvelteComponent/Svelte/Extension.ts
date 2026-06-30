import { Mark } from '@tiptap/core'
import { SvelteMarkViewRenderer } from '@tiptap/svelte'

import Component from './Component.svelte'

export default Mark.create({
  name: 'svelteComponent',

  addAttributes() {
    return {
      'data-count': { default: 0 },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'svelte-component',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['svelte-component', HTMLAttributes]
  },

  addMarkView() {
    return SvelteMarkViewRenderer(Component)
  },
})
