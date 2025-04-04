import { Extension } from '@tiptap/react'

function findExampleWords(word, state) {
  const positions = []

  state.doc.descendants((node, pos) => {
    if (node.isText && node.text.includes(word)) {
      // find all occurrences of the word “example”, don't stop after the first
      for (let i = 0; i < node.text.length; i += 1) {
        if (node.text.substr(i).startsWith(word)) {
          positions.push({ from: pos + i, to: pos + i + word.length })
        }
      }
    }
  })

  return positions
}

export const StarDecoration = Extension.create({
  name: 'exampleDecorations',

  decorations: {
    create({ state }) {
      const positions = findExampleWords('fancy', state)

      const decorationItems = []

      positions.forEach(pos => {
        decorationItems.push({
          from: pos.to,
          to: pos.to,
          type: 'widget',
          widget: () => {
            const el = document.createElement('span')
            el.textContent = '⭐️'
            return el
          },
        })
      })

      return decorationItems
    },
  },
})
