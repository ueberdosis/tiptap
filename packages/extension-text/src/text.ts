import { Node } from '@tiptap/core'

export const Text = Node.create({
  name: 'text',
  group: 'inline',
})

declare module '@tiptap/core' {
  interface AllExtensions {
    Text: typeof Text,
  }
}
