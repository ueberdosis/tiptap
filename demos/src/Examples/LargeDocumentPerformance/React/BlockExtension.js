import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import Block from './Block.jsx'

/**
 * A block holding a text container, both rendered by React node views. Nesting
 * them is what large documents look like in practice: two node view instances
 * per visible block.
 */
export const PerfBlock = Node.create({
  name: 'perfBlock',

  group: 'block',

  content: 'perfTextContainer+',

  parseHTML() {
    return [{ tag: 'div[data-perf-block]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-perf-block': '' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(Block)
  },
})

export const PerfTextContainer = Node.create({
  name: 'perfTextContainer',

  content: 'inline*',

  parseHTML() {
    return [{ tag: 'div[data-perf-text-container]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-perf-text-container': '' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(Block)
  },
})
