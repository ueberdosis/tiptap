import { Plugin, PluginKey } from '@tiptap/pm/state'

import { Extension } from '../Extension.js'

/**
 * Options for the Tabindex extension.
 */
export type TabindexOptions = {
  /**
   * The value for the `tabindex` attribute on the editor element.
   * When undefined, editable editors default to `0` and non-editable editors get no tabindex.
   */
  value?: string
}

/**
 * The Tabindex extension adds a configurable tabindex attribute to the editor.
 *
 * By default, the editor gets tabindex="0" when editable. This can be customized
 * via coreExtensionOptions to support specific focus ordering requirements in forms
 * or to enable focusing on non-editable editors.
 *
 * @example
 * ```ts
 * new Editor({
 *   coreExtensionOptions: {
 *     tabindex: {
 *       value: '-1',
 *     },
 *   },
 * })
 * ```
 */
export const Tabindex = Extension.create<TabindexOptions>({
  name: 'tabindex',

  addOptions() {
    return {
      value: undefined,
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('tabindex'),
        props: {
          attributes: (): { [name: string]: string } => {
            if (!this.editor.isEditable && this.options.value === undefined) {
              return {}
            }
            return { tabindex: this.options.value ?? '0' }
          },
        },
      }),
    ]
  },
})
