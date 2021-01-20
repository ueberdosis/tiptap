import { Node } from '@tiptap/core'

export const Table = Node.create({
  name: 'table',
})

declare module '@tiptap/core' {
  interface AllExtensions {
    Table: typeof Table,
  }
}
