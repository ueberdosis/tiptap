import { Node } from '@tiptap/core'

const Text = Node.create({
  name: 'text',
  group: 'inline',
})

export default Text

declare module '@tiptap/core' {
  interface AllExtensions {
    Text: typeof Text,
  }
}
