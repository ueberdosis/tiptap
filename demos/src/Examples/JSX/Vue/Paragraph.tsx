/** @jsxImportSource @tiptap/editor */
import { mergeAttributes } from '@tiptap/editor'
import { Paragraph as BaseParagraph } from '@tiptap/extension-paragraph'

export const Paragraph = BaseParagraph.extend({
  renderHTML({ HTMLAttributes }) {
    return (
      <p {...mergeAttributes(HTMLAttributes, { style: 'color: red' })}>
        <slot />
      </p>
    )
  },
})
