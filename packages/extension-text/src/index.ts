import { NodeExtension } from '@tiptap/core'

const Text = NodeExtension.create({
  name: 'text',
  group: 'inline',
})

export default Text

declare module '@tiptap/core' {
  interface AllExtensions {
    Text: typeof Text,
  }
}
