import { Extension } from '@tiptap/react'

import { findWordPositions } from '../findWordPositions.js'

export const StarDecoration = Extension.create({
  name: 'exampleDecorations',

  decorations: () => {
    let positions = []
    return {
      create({ state }) {
        positions = findWordPositions('fancy', state)

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
      equiresUpdate: ({ newState }) => {
        const newPositions = findWordPositions('fancy', newState)

        if (newPositions.length !== positions.length) {
          return true
        }

        for (let i = 0; i < newPositions.length; i += 1) {
          if (newPositions[i].from !== positions[i].from || newPositions[i].to !== positions[i].to) {
            return true
          }
        }

        return false
      },
    }
  },
})
