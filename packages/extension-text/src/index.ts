import { Node } from '@tiptap/core'

const Text = Node.create({
  name: 'text',
  group: 'inline',
})

export default Text

declare global {
  namespace Tiptap {
    interface AllExtensions {
      Text: typeof Text,
    }
  }
}
