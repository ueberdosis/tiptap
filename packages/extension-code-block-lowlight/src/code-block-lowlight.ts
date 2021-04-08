import CodeBlock from '@tiptap/extension-code-block'
import { LowlightPlugin } from './lowlight-plugin'

export const CodeBlockLowlight = CodeBlock.extend({
  addProseMirrorPlugins() {
    return [
      LowlightPlugin({ name: 'codeBlock' }),
    ]
  },
})
