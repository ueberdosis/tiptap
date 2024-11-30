import { mergeAttributes, Node } from '@tiptap/core'

export default Node.create({
  name: 'foo',

  group: 'inline',

  inline: true,

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: node => (node as HTMLElement).hasAttribute('data-foo') && null,
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ 'data-foo': '', HTMLAttributes }), 'foo']
  },

  renderText() {
    return 'foo'
  },
})
