import { Extension } from '@tiptap/core'

import { Direction, DirectionPlugin } from './text-direction-plugin'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textDirection: {
      setTextDirection: (direction: Direction) => ReturnType;
    };
  }
}

export interface TextDirectionOptions {
  types: string[];
  directions: string[];
  defaultDirection: Direction | null;
}

export const TextDirection = Extension.create<TextDirectionOptions>({
  name: 'textDirection',

  addOptions() {
    return {
      types: [],
      directions: ['ltr', 'rtl'],
      defaultDirection: null,
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          dir: {
            default: this.options.defaultDirection,
            parseHTML: element => {
              return element.dir
            },
            renderHTML: attributes => {
              return { dir: attributes.dir }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setTextDirection:
        direction => ({ commands }) => {
          if (!this.options.directions || !this.options.directions.includes(direction)) {
            return false
          }

          return this.options.types.every(type => commands.updateAttributes(type, { dir: direction }))
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      DirectionPlugin({
        types: this.options.types,
        defaultDirection: this.options.defaultDirection,
      }),
    ]
  },
})
