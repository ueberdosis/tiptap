import * as extensions from './extensions'

export { extensions }
export * from './Editor'
export * from './Extension'
export * from './Node'
export * from './Mark'
export * from './NodeView'
export * from './Tracker'
export * from './InputRule'
export * from './PasteRule'
export * from './CommandManager'
export * from './types'

export * from './inputRules/nodeInputRule'
export * from './inputRules/markInputRule'
export * from './inputRules/textblockTypeInputRule'
export * from './inputRules/textInputRule'
export * from './inputRules/wrappingInputRule'
export * from './pasteRules/markPasteRule'
export * from './pasteRules/textPasteRule'

export * from './utilities/callOrReturn'
export * from './utilities/mergeAttributes'

export * from './helpers/combineTransactionSteps'
export * from './helpers/defaultBlockAt'
export * from './helpers/getExtensionField'
export * from './helpers/findChildren'
export * from './helpers/findChildrenInRange'
export * from './helpers/findParentNode'
export * from './helpers/findParentNodeClosestToPos'
export * from './helpers/generateHTML'
export * from './helpers/generateJSON'
export * from './helpers/generateText'
export * from './helpers/getChangedRanges'
export * from './helpers/getSchema'
export * from './helpers/getHTMLFromFragment'
export * from './helpers/getDebugJSON'
export * from './helpers/getAttributes'
export * from './helpers/getMarkAttributes'
export * from './helpers/getMarkRange'
export * from './helpers/getMarkType'
export * from './helpers/getMarksBetween'
export * from './helpers/getNodeAttributes'
export * from './helpers/getNodeType'
export * from './helpers/getText'
export * from './helpers/getTextBetween'
export * from './helpers/isActive'
export * from './helpers/isList'
export * from './helpers/isMarkActive'
export * from './helpers/isNodeActive'
export * from './helpers/isNodeEmpty'
export * from './helpers/isNodeSelection'
export * from './helpers/isTextSelection'
export * from './helpers/posToDOMRect'

// eslint-disable-next-line
export interface Commands<ReturnType = any> {}

// eslint-disable-next-line
export interface ExtensionConfig<Options = any, Storage = any> {}

// eslint-disable-next-line
export interface NodeConfig<Options = any, Storage = any> {}

// eslint-disable-next-line
export interface MarkConfig<Options = any, Storage = any> {}
