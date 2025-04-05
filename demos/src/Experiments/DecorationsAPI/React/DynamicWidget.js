import { Extension, WidgetRenderer } from '@tiptap/react'

import { findWordPositions } from '../findWordPositions.js'
import { DynamicWidget as DynamicWidgetComponent } from './DynamicWidget.jsx'

export const DynamicWidget = Extension.create({
  name: 'dynamicWidget',

  decorations: ({ editor }) => {
    let positions = []

    return {
      create({ state }) {
        positions = findWordPositions('fancy', state)

        const decorationItems = []

        positions.forEach(pos => {
          decorationItems.push({
            from: pos.from,
            to: pos.from,
            type: 'widget',
            widget: () => {
              return WidgetRenderer.create(DynamicWidgetComponent, {
                editor,
                as: 'span',
                pos,
              })
            },
          })
        })

        return decorationItems
      },
      requiresUpdate: ({ newState }) => {
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
