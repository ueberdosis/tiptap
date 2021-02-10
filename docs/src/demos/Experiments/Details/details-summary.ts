import { Node } from '@tiptap/core'

export interface DetailsSummaryOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

export default Node.create<DetailsSummaryOptions>({
  name: 'detailsSummary',

  content: 'inline*',

  // group: 'block',

  defaultOptions: {
    HTMLAttributes: {},
  },

  parseHTML() {
    return [{
      tag: 'summary',
    }]
  },

  renderHTML() {
    return ['summary', 0]
  },
})
