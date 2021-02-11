import { Node } from '@tiptap/core'

export interface DetailsSummaryOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

export default Node.create({
  name: 'detailsSummary',

  content: 'inline*',

  group: 'block',

  isolating: true,

  defaultOptions: <DetailsSummaryOptions>{
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
