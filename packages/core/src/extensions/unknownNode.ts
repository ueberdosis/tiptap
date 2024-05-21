import { Node } from '../Node.js'

export const UnknownNode = Node.create({
  name: 'unknownNode',

  priority: Number.MIN_SAFE_INTEGER,

  addAttributes() {
    return {
      tagName: {
        default: 'unknown-tag',
        parseHTML: node => {
          const tagName = node.tagName

          if (tagName === 'UNKNOWN-NODE') {
            return node.getAttribute('tagname')
          }
          return tagName
        },
      },
      innerHTML: {
        default: null,
        parseHTML: node => {
          const tagName = node.tagName

          if (tagName === 'UNKNOWN-NODE') {
            return node.getAttribute('innerhtml')
          }
          return node.innerHTML
        },
      },
      attributes: {
        default: {},
        parseHTML: node => {
          const tagName = node.tagName

          if (tagName === 'UNKNOWN-NODE') {
            return node.getAttribute('attributes')
          }

          return JSON.stringify(node.getAttributeNames().reduce((acc, name) => {
            // @ts-ignore
            acc[name] = node.getAttribute(name)
            return acc
          }, {}))
        },
      },
    }
  },

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [
      {
        tag: 'unknown-node[tagName]',
        getAttrs: dom => {
          return {
            attributes: typeof dom !== 'string' ? dom.getAttribute('attributes') : null,
            tagName: typeof dom !== 'string' ? dom.getAttribute('tagName') : null,
            innerHTML: typeof dom !== 'string' ? dom.getAttribute('innerHTML') : null,
          }
        },
      },
      {
        tag: '*',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [HTMLAttributes.tagName, { ...JSON.parse(HTMLAttributes.attributes), 'data-tiptap-placeholder': true }, HTMLAttributes.innerHTML]
  },
})
