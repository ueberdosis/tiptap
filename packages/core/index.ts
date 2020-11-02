import { Editor, Command, CommandsSpec } from './src/Editor'

export default Editor
export { Editor, Command, CommandsSpec }

export * from './src/Extension'
export * from './src/NodeExtension'
export * from './src/MarkExtension'
export * from './src/types'

export { default as nodeInputRule } from './src/inputRules/nodeInputRule'
export { default as markInputRule } from './src/inputRules/markInputRule'
export { default as markPasteRule } from './src/pasteRules/markPasteRule'

export { default as getSchema } from './src/utils/getSchema'
export { default as generateHTML } from './src/utils/generateHTML'
export { default as getHTMLFromFragment } from './src/utils/getHTMLFromFragment'
export { default as getMarkAttrs } from './src/utils/getMarkAttrs'
export { default as mergeAttributes } from './src/utils/mergeAttributes'
