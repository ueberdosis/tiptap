import {
  type AnyExtension,
  callOrReturn,
  Extension,
  getExtensionField,
  type NodeConfig,
} from '@tiptap/core'

/**
 * The attribute name used to store the hash on nodes.
 */
const ATTRIBUTE_NAME = '_hash'

/**
 * Checks whether the editor already includes the full {@link AiToolkit} extension.
 *
 * @param extensionNames - Extension names available in the current editor setup.
 * @return `true` when the AI Toolkit extension is installed.
 */
function hasAiToolkitExtension(extensionNames: string[]): boolean {
  return extensionNames.includes('aiToolkit')
}

/**
 * Checks whether an extension declares an inline node.
 *
 * @param extension - The extension to check.
 * @return `true` when the node is inline.
 */
function isInlineNode(extension: AnyExtension): boolean {
  try {
    // `inline` can be a function, and it runs here without the editor core passes
    return (
      callOrReturn(
        getExtensionField<NodeConfig['inline']>(extension, 'inline', {
          name: extension.name,
          options: extension.options,
          storage: extension.storage,
        }),
      ) === true
    )
  } catch {
    // Fall back to the previous static check when `inline` needs an editor
    return typeof extension.config?.group === 'string' && extension.config.group.includes('inline')
  }
}

/**
 * A Tiptap extension that registers `_hash` on non-inline nodes.
 *
 * The server package only contributes the attribute definition when AI Toolkit
 * itself is not already installed.
 */
export const ServerAiToolkitHashExtension = Extension.create({
  name: 'serverAiToolkitHash',

  /**
   * Registers the hash attribute on all non-inline, non-text, non-doc node types.
   *
   * @return The global attribute configuration.
   */
  addGlobalAttributes() {
    if (hasAiToolkitExtension(this.extensions.map(extension => extension.name))) {
      return []
    }

    const types = this.extensions
      .filter(ext => {
        if (
          // Only add hashes to nodes, not to marks
          ext.type !== 'node' ||
          // Exclude certain node types
          ext.name === 'text' ||
          ext.name === 'doc' ||
          ext.name === 'tableHeader' ||
          ext.name === 'tableCell' ||
          // Exclude inline nodes
          isInlineNode(ext)
        ) {
          return false
        }
        return true
      })
      .map(ext => ext.name)

    return [
      {
        types,
        attributes: {
          [ATTRIBUTE_NAME]: {
            default: null,
            parseHTML: (element: HTMLElement) => element.getAttribute(ATTRIBUTE_NAME),
            renderHTML: (attributes: Record<string, unknown>) => {
              if (!attributes[ATTRIBUTE_NAME]) {
                return {}
              }

              return {
                [ATTRIBUTE_NAME]: attributes[ATTRIBUTE_NAME],
              }
            },
          },
        },
      },
    ]
  },
})
