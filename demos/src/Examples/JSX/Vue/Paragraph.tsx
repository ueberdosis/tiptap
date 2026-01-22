/** @jsxImportSource @tiptap/core */
import { mergeAttributes } from '@dibdab/core'
import { Paragraph as BaseParagraph } from '@dibdab/extension-paragraph'

export const Paragraph = BaseParagraph.extend({
  renderHTML({ HTMLAttributes }) {
    return (
      <p {...mergeAttributes(HTMLAttributes, { style: 'color: red' })}>
        <slot />
      </p>
    )
  },
})
