import lowlight from 'lowlight/lib/core'
import CodeBlock, { CodeBlockOptions } from '@tiptap/extension-code-block'
import { LowlightPlugin } from './lowlight-plugin'

export interface CodeBlockLowlightOptions extends CodeBlockOptions {
  lowlight: any,
}

export const CodeBlockLowlight = CodeBlock.extend<CodeBlockLowlightOptions>({
  defaultOptions: {
    ...CodeBlock.config.defaultOptions,
    lowlight,
  },

  addProseMirrorPlugins() {
    return [
      // disable for now, see: https://github.com/ueberdosis/tiptap-next/issues/259#issuecomment-817954835
      // ...this.parentConfig.addProseMirrorPlugins?.() || [],
      LowlightPlugin({
        name: 'codeBlock',
        lowlight: this.options.lowlight,
      }),
    ]
  },
})
