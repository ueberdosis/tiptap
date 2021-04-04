import CodeBlock, { CodeBlockOptions } from '@tiptap/extension-code-block'
import lowlight from 'lowlight/lib/core'
import { LowlightPlugin } from './lowlight-plugin'

export interface CodeBlockLowlightOptions extends CodeBlockOptions {
  languages: {
    [key: string]: Function,
  },
}

export const CodeBlockLowlight = CodeBlock.extend<CodeBlockLowlightOptions>({
  defaultOptions: {
    ...CodeBlock.config.defaultOptions,
    languages: {},
  },

  onBeforeCreate() {
    Object
      .entries(this.options.languages)
      .forEach(([name, mapping]) => {
        lowlight.registerLanguage(name, mapping)
      })
  },

  addProseMirrorPlugins() {
    return [
      LowlightPlugin({ name: 'codeBlock' }),
    ]
  },
})
