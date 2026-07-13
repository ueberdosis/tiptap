import { Extension } from '@tiptap/core'

/**
 * The attribute name used to store the hash on nodes.
 */
const ATTRIBUTE_NAME = '_hash'

const EXCLUDED_NODE_TYPES = new Set(['text', 'doc', 'tableHeader', 'tableCell'])

type Extension = {
  config?: { group?: unknown }
  name: string
  type: string
}

/**
 * Checks whether the editor already includes the full {@link AiToolkit} extension.
 *
 * @param extensionNames - Extension names available in the current editor setup.
 * @return `true` when the AI Toolkit extension is installed.
 */
function hasAiToolkitExtension(extensionNames: string[]): boolean {
  return extensionNames.includes('aiToolkit')
}

function isInlineExtension(extension: Extension): boolean {
  return typeof extension.config?.group === 'string' && extension.config.group.includes('inline')
}

/**
 * Checks whether an extension is a node that should receive a hash attribute.
 *
 * @param extension - Extension to check.
 * @return `true` when the extension should receive the hash attribute.
 */
function shouldAddHashAttribute(extension: Extension): boolean {
  return (
    extension.type === 'node' &&
    !EXCLUDED_NODE_TYPES.has(extension.name) &&
    !isInlineExtension(extension)
  )
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

    const types = this.extensions.filter(shouldAddHashAttribute).map(ext => ext.name)

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
