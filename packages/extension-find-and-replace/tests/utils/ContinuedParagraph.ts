import Paragraph from '@tiptap/extension-paragraph'

/** A paragraph that can mark itself as the continuation of the paragraph before it. */
export const ContinuedParagraph = Paragraph.extend({
  addAttributes() {
    return {
      continued: {
        default: false,
        parseHTML: element => element.hasAttribute('data-continued'),
        renderHTML: attributes => (attributes.continued ? { 'data-continued': '' } : {}),
      },
    }
  },
})
