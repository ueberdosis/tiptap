import { Node, mergeAttributes } from '@tiptap/core'

export interface TableOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

export const Table = Node.create({
  name: 'table',

  defaultOptions: <TableOptions>{
    HTMLAttributes: {},
  },

  content: 'tableRow+',

  // tableRole: 'table',

  isolating: true,

  group: 'block',

  parseHTML() {
    return [{ tag: 'table' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['table', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), ['tbody', 0]]
  },
})

declare module '@tiptap/core' {
  interface AllExtensions {
    Table: typeof Table,
  }
}
