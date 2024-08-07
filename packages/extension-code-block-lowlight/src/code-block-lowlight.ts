import CodeBlock, { CodeBlockOptions } from '@tiptap/extension-code-block'

import { LowlightPlugin } from './lowlight-plugin.js'

export interface CodeBlockLowlightOptions extends CodeBlockOptions {
  /**
   * The lowlight instance.
   */
  lowlight: any,
}

/**
 * This extension allows you to highlight code blocks with lowlight.
 * @see https://tiptap.dev/api/nodes/code-block-lowlight
 */
export const CodeBlockLowlight = CodeBlock.extend<CodeBlockLowlightOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      lowlight: {},
    }
  },

  addProseMirrorPlugins() {
    return [
      ...this.parent?.() || [],
      LowlightPlugin({
        name: this.name,
        lowlight: this.options.lowlight,
        defaultLanguage: this.options.defaultLanguage,
      }),
    ]
  },
})
