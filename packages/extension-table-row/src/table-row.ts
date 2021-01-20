import { Node } from '@tiptap/core'

export const TableRow = Node.create({
  name: 'tableRow',
})

declare module '@tiptap/core' {
  interface AllExtensions {
    TableRow: typeof TableRow,
  }
}
