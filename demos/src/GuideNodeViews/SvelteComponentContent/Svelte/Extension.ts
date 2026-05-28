import { mergeAttributes, Node } from '@tiptap/core'
import { SvelteNodeViewRenderer } from '@tiptap/svelte'

import Component from './Component.svelte'

export default Node.create({
  name: 'svelteComponent',

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [
      {
        tag: 'svelte-component',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['svelte-component', mergeAttributes(HTMLAttributes), 0]
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => {
        return this.editor
          .chain()
          .insertContentAt(this.editor.state.selection.head, { type: this.type.name })
          .focus()
          .run()
      },
    }
  },

  addNodeView() {
    return SvelteNodeViewRenderer(Component)
  },
})
