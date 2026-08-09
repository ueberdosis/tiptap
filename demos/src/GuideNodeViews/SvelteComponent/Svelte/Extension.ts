import { mergeAttributes, Node } from '@tiptap/core'
import { SvelteNodeViewRenderer } from '@tiptap/svelte'

import Component from './Component.svelte'

export default Node.create({
  name: 'svelteComponent',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      count: {
        default: 0,
      },
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
    return ['svelte-component', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return SvelteNodeViewRenderer(Component)
  },
})
