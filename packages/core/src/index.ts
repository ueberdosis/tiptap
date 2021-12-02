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

export { default as nodeInputRule } from './inputRules/nodeInputRule'
export { default as markInputRule } from './inputRules/markInputRule'
export { default as textblockTypeInputRule } from './inputRules/textblockTypeInputRule'
export { default as textInputRule } from './inputRules/textInputRule'
export { default as wrappingInputRule } from './inputRules/wrappingInputRule'
export { default as markPasteRule } from './pasteRules/markPasteRule'
export { default as textPasteRule } from './pasteRules/textPasteRule'

export { default as callOrReturn } from './utilities/callOrReturn'
export { default as mergeAttributes } from './utilities/mergeAttributes'

export { default as combineTransactionSteps } from './helpers/combineTransactionSteps'
export { default as defaultBlockAt } from './helpers/defaultBlockAt'
export { default as getExtensionField } from './helpers/getExtensionField'
export { default as findChildren } from './helpers/findChildren'
export { default as findChildrenInRange } from './helpers/findChildrenInRange'
export { default as findParentNode } from './helpers/findParentNode'
export { default as findParentNodeClosestToPos } from './helpers/findParentNodeClosestToPos'
export { default as generateHTML } from './helpers/generateHTML'
export { default as generateJSON } from './helpers/generateJSON'
export { default as generateText } from './helpers/generateText'
export { default as getChangedRanges } from './helpers/getChangedRanges'
export { default as getSchema } from './helpers/getSchema'
export { default as getHTMLFromFragment } from './helpers/getHTMLFromFragment'
export { default as getDebugJSON } from './helpers/getDebugJSON'
export { default as getAttributes } from './helpers/getAttributes'
export { default as getMarkAttributes } from './helpers/getMarkAttributes'
export { default as getMarkRange } from './helpers/getMarkRange'
export { default as getMarkType } from './helpers/getMarkType'
export { default as getMarksBetween } from './helpers/getMarksBetween'
export { default as getNodeAttributes } from './helpers/getNodeAttributes'
export { default as getNodeType } from './helpers/getNodeType'
export { default as getText } from './helpers/getText'
export { default as getTextBetween } from './helpers/getTextBetween'
export { default as isActive } from './helpers/isActive'
export { default as isList } from './helpers/isList'
export { default as isMarkActive } from './helpers/isMarkActive'
export { default as isNodeActive } from './helpers/isNodeActive'
export { default as isNodeEmpty } from './helpers/isNodeEmpty'
export { default as isNodeSelection } from './helpers/isNodeSelection'
export { default as isTextSelection } from './helpers/isTextSelection'
export { default as posToDOMRect } from './helpers/posToDOMRect'

// eslint-disable-next-line
export interface Commands<ReturnType = any> {}

// eslint-disable-next-line
export interface ExtensionConfig<Options = any, Storage = any> {}

// eslint-disable-next-line
export interface NodeConfig<Options = any, Storage = any> {}

// eslint-disable-next-line
export interface MarkConfig<Options = any, Storage = any> {}
