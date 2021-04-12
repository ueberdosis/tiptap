import CodeBlock from '@tiptap/extension-code-block'
import { LowlightPlugin } from './lowlight-plugin'

export const CodeBlockLowlight = CodeBlock.extend({
  addProseMirrorPlugins() {
    return [
      ...this.parentConfig.addProseMirrorPlugins?.() || [],
      LowlightPlugin({ name: 'codeBlock' }),
    ]
  },
})
