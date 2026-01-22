import { mergeAttributes, Node } from '@dibdab/core'
import { ReactNodeViewRenderer } from '@dibdab/react'

import { RecommendationView } from './views/index.jsx'

export const Recommendation = Node.create({
  name: 'recommendation',

  group: 'block',

  draggable: true,

  addOptions() {
    return {
      publicationId: '',
      HTMLAttributes: {
        class: `node-${this.name}`,
      },
    }
  },

  addAttributes() {
    return {
      id: {
        default: undefined,
        parseHTML: element => element.getAttribute('data-id'),
        renderHTML: attributes => ({
          'data-id': attributes.id,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: `div.node-${this.name}`,
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      setRecommendation:
        () =>
        ({ chain }) =>
          chain()
            .focus()
            .insertContent({
              type: this.name,
            })
            .run(),
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(RecommendationView)
  },
})

export default Recommendation
