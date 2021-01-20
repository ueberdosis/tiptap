import { Node } from '@tiptap/core'

export const TableCell = Node.create({
  name: 'tableCell',
})

declare module '@tiptap/core' {
  interface AllExtensions {
    TableCell: typeof TableCell,
  }
}
