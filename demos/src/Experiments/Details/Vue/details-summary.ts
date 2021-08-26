import { Node } from '@tiptap/core'

export interface DetailsSummaryOptions {
  HTMLAttributes: {
    [key: string]: any
  },
}

export default Node.create<DetailsSummaryOptions>({
  name: 'detailsSummary',

  content: 'text*',

  marks: '',

  group: 'block',

  isolating: true,

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
