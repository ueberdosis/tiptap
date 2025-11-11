import { Plugin, PluginKey } from '@tiptap/pm/state'

import { Extension } from '../Extension.js'
import { splitExtensions } from '../helpers/splitExtensions.js'

export interface TextDirectionOptions {
  direction: 'ltr' | 'rtl' | 'auto' | undefined
}

/**
 * The TextDirection extension adds support for setting text direction (LTR/RTL/auto)
 * on all nodes in the editor.
 *
 * This extension adds a global `dir` attribute to all node types, which can be used
 * to control bidirectional text rendering. The direction can be set globally via
 * editor options or per-node using commands.
 */
export const TextDirection = Extension.create<TextDirectionOptions>({
  name: 'textDirection',

  addOptions() {
    return {
      direction: undefined,
    }
  },

  addGlobalAttributes() {
    const { nodeExtensions } = splitExtensions(this.extensions)

    return [
      {
        types: nodeExtensions.filter(extension => extension.name !== 'text').map(extension => extension.name),
        attributes: {
          dir: {
            default: this.options.direction || null,
            parseHTML: element => {
              const dir = element.getAttribute('dir')

              if (dir && (dir === 'ltr' || dir === 'rtl' || dir === 'auto')) {
                return dir
              }

              return this.options.direction || null
            },
            renderHTML: attributes => {
              if (!attributes.dir) {
                return {}
              }

              return {
                dir: attributes.dir,
              }
            },
          },
        },
      },
    ]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('textDirection'),
        props: {
          attributes: (): { [name: string]: string } => {
            const direction = this.options.direction

            if (!direction) {
              return {}
            }

            return {
              dir: direction,
            }
          },
        },
      }),
    ]
  },
})
