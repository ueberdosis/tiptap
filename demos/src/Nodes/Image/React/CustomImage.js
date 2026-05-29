import { Image as TiptapImage } from '@tiptap/extension-image'

export const CustomImage = TiptapImage.extend({
  content: 'inline*',
  addAttributes() {
    return {
      ...this.parent?.(),
      showCaption: {
        default: false,
      },
    }
  },
})
