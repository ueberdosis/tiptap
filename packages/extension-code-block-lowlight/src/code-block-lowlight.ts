import CodeBlock from '@tiptap/extension-code-block'
import low from 'lowlight/lib/core'
import { LowlightPlugin } from './lowlight-plugin'

export interface CodeBlockLowlightOptions {
  languageClassPrefix: string,
  HTMLAttributes: {
    [key: string]: any
  },
  languages: {
    [key: string]: Function
  },
}

export const CodeBlockLowlight = CodeBlock.extend<CodeBlockLowlightOptions>({
  name: 'codeBlockLowlight',

  defaultOptions: {
    languageClassPrefix: 'language-',
    HTMLAttributes: {},
    languages: {},
  },

  onBeforeCreate() {
    Object.entries(this.options.languages).forEach(([name, mapping]) => {
      low.registerLanguage(name, mapping)
    })
  },

  addProseMirrorPlugins() {
    return [
      LowlightPlugin({ name: 'codeBlockLowlight' }),
    ]
  },
})
