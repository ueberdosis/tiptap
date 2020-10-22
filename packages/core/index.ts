import { Editor, Command, CommandsSpec } from './src/Editor'

export default Editor
export { Editor, Command, CommandsSpec }
export { default as ComponentRenderer } from './src/ComponentRenderer'

export * from './src/Extension'
export * from './src/Node'
export * from './src/Mark'
export * from './src/types'

export { default as nodeInputRule } from './src/inputRules/nodeInputRule'
export { default as markInputRule } from './src/inputRules/markInputRule'
export { default as markPasteRule } from './src/pasteRules/markPasteRule'

export { default as capitalize } from './src/utils/capitalize'
export { default as getSchema } from './src/utils/getSchema'
export { default as generateHtml } from './src/utils/generateHtml'
export { default as getHtmlFromFragment } from './src/utils/getHtmlFromFragment'
export { default as getMarkAttrs } from './src/utils/getMarkAttrs'
