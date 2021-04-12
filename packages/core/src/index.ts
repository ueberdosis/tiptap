export * from './Editor'
export * from './Extension'
export * from './Node'
export * from './Mark'
export * from './NodeView'
export * from './types'

export { default as nodeInputRule } from './inputRules/nodeInputRule'
export { default as markInputRule } from './inputRules/markInputRule'
export { default as markPasteRule } from './pasteRules/markPasteRule'

export { default as callOrReturn } from './utilities/callOrReturn'
export { default as mergeAttributes } from './utilities/mergeAttributes'

export { default as createExtensionContext } from './helpers/createExtensionContext'
export { default as findChildren } from './helpers/findChildren'
export { default as findParentNode } from './helpers/findParentNode'
export { default as findParentNodeClosestToPos } from './helpers/findParentNodeClosestToPos'
export { default as generateHTML } from './helpers/generateHTML'
export { default as getSchema } from './helpers/getSchema'
export { default as getHTMLFromFragment } from './helpers/getHTMLFromFragment'
export { default as getMarkAttributes } from './helpers/getMarkAttributes'
export { default as isActive } from './helpers/isActive'
export { default as isMarkActive } from './helpers/isMarkActive'
export { default as isNodeActive } from './helpers/isNodeActive'
export { default as isNodeEmpty } from './helpers/isNodeEmpty'
export { default as isNodeSelection } from './helpers/isNodeSelection'
export { default as isTextSelection } from './helpers/isTextSelection'

export interface Commands {}

// eslint-disable-next-line
export interface ExtensionConfig<Options = any> {}

// eslint-disable-next-line
export interface NodeConfig<Options = any> {}

// eslint-disable-next-line
export interface MarkConfig<Options = any> {}
