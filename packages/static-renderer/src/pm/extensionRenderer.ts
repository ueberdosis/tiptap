/* oslint-disable no-plusplus */
/* oslint-disableno-explicit-any */

import type {
  ExtensionAttribute,
  Extensions,
  JSONContent,
  Mark as MarkExtension,
  MarkConfig,
  Node as NodeExtension,
  NodeConfig,
} from '@tiptap/core'
import {
  extensions as coreExtensions,
  getAttributesFromExtensions,
  getExtensionField,
  getSchemaByResolvedExtensions,
  resolveExtensions,
  splitExtensions,
} from '@tiptap/core'
import type { DOMOutputSpec, Mark } from '@tiptap/pm/model'
import { Node } from '@tiptap/pm/model'

import { getHTMLAttributes } from '../helpers.js'
import type { MarkProps, NodeProps, TiptapStaticRendererOptions } from '../json/renderer.js'

export type DomOutputSpecToElement<T> = (content: DOMOutputSpec) => (children?: T | T[]) => T

/**
 * Options that mirror a subset of `EditorOptions` and affect rendered output.
 * Kept narrow on purpose: only options whose effect is reproducible without an
 * `Editor` instance belong here.
 */
export type StaticEditorOptions = {
  /**
   * Sets the text direction for all non-text nodes. Matches the `textDirection`
   * editor option on `Editor`. The configured `TextDirection` extension is
   * prepended to the user-supplied `extensions`; if a user-supplied
   * `TextDirection` is also present, the user's wins (last-defined precedence —
   * same as Editor).
   */
  textDirection?: 'ltr' | 'rtl' | 'auto'
}

/**
 * Apply editor-level options to the user's extension array.
 *
 * Mirrors `new Editor({ textDirection })`: the option-driven `TextDirection`
 * extension is prepended so a user-supplied `TextDirection` (which comes after)
 * can override it via tiptap's last-defined precedence for duplicate extensions.
 *
 * Known limitation: this only inspects top-level extensions. A `TextDirection`
 * bundled inside a kit (e.g. `StarterKit`) is not detected for override
 * purposes — today no shipped kit includes `TextDirection`, so this is purely
 * theoretical.
 */
export function applyStaticEditorOptionsToExtensions(
  extensions: Extensions,
  options?: StaticEditorOptions,
): Extensions {
  if (!options?.textDirection) {
    return extensions
  }

  return [coreExtensions.TextDirection.configure({ direction: options.textDirection }), ...extensions]
}

/**
 * This takes a NodeExtension and maps it to a React component
 * @param extension The node extension to map to a React component
 * @param extensionAttributes All available extension attributes
 * @returns A tuple with the name of the extension and a React component that renders the extension
 */
export function mapNodeExtensionToReactNode<T>(
  domOutputSpecToElement: DomOutputSpecToElement<T>,
  extension: NodeExtension,
  extensionAttributes: ExtensionAttribute[],
  options?: Partial<Pick<TiptapStaticRendererOptions<T, Mark, Node>, 'unhandledNode'>>,
): [string, (props: NodeProps<Node, T | T[]>) => T] {
  const context = {
    name: extension.name,
    options: extension.options,
    storage: extension.storage,
    parent: extension.parent,
  }

  const renderToHTML = getExtensionField<NodeConfig['renderHTML']>(extension, 'renderHTML', context)

  if (!renderToHTML) {
    if (options?.unhandledNode) {
      return [extension.name, options.unhandledNode]
    }
    return [
      extension.name,
      () => {
        throw new Error(
          `[tiptap error]: Node ${extension.name} cannot be rendered, it is missing a "renderToHTML" method, please implement it or override the corresponding "nodeMapping" method to have a custom rendering`,
        )
      },
    ]
  }

  return [
    extension.name,
    ({ node, children }) => {
      try {
        return domOutputSpecToElement(
          renderToHTML({
            node,
            HTMLAttributes: getHTMLAttributes(node, extensionAttributes),
          }),
        )(children)
      } catch (e) {
        throw new Error(
          `[tiptap error]: Node ${
            extension.name
          } cannot be rendered, it's "renderToHTML" method threw an error: ${(e as Error).message}`,
          { cause: e },
        )
      }
    },
  ]
}

/**
 * This takes a MarkExtension and maps it to a React component
 * @param extension The mark extension to map to a React component
 * @param extensionAttributes All available extension attributes
 * @returns A tuple with the name of the extension and a React component that renders the extension
 */
export function mapMarkExtensionToReactNode<T>(
  domOutputSpecToElement: DomOutputSpecToElement<T>,
  extension: MarkExtension,
  extensionAttributes: ExtensionAttribute[],
  options?: Partial<Pick<TiptapStaticRendererOptions<T, Mark, Node>, 'unhandledMark'>>,
): [string, (props: MarkProps<Mark, T | T[]>) => T] {
  const context = {
    name: extension.name,
    options: extension.options,
    storage: extension.storage,
    parent: extension.parent,
  }

  const renderToHTML = getExtensionField<MarkConfig['renderHTML']>(extension, 'renderHTML', context)

  if (!renderToHTML) {
    if (options?.unhandledMark) {
      return [extension.name, options.unhandledMark]
    }
    return [
      extension.name,
      () => {
        throw new Error(
          `Node ${extension.name} cannot be rendered, it is missing a "renderToHTML" method`,
        )
      },
    ]
  }

  return [
    extension.name,
    ({ mark, children }) => {
      try {
        return domOutputSpecToElement(
          renderToHTML({
            mark,
            HTMLAttributes: getHTMLAttributes(mark, extensionAttributes),
          }),
        )(children)
      } catch (e) {
        throw new Error(
          `[tiptap error]: Mark ${
            extension.name
          } cannot be rendered, it's "renderToHTML" method threw an error: ${(e as Error).message}`,
          { cause: e },
        )
      }
    },
  ]
}

/**
 * This function will statically render a Prosemirror Node to a target element type using the given extensions
 * @param renderer The renderer to use to render the Prosemirror Node to the target element type
 * @param domOutputSpecToElement A function that takes a Prosemirror DOMOutputSpec and returns a function that takes children and returns the target element type
 * @param mapDefinedTypes An object with functions to map the doc and text types to the target element type
 * @param content The Prosemirror Node to render
 * @param extensions The extensions to use to render the Prosemirror Node
 * @param options Additional options to pass to the renderer that can override the default behavior
 * @returns The rendered target element type
 */
export function renderToElement<T>({
  renderer,
  domOutputSpecToElement,
  mapDefinedTypes,
  content,
  extensions,
  options,
}: {
  renderer: (options: TiptapStaticRendererOptions<T, Mark, Node>) => (ctx: { content: Node }) => T
  domOutputSpecToElement: DomOutputSpecToElement<T>
  mapDefinedTypes: {
    doc: (props: NodeProps<Node, T | T[]>) => T
    text: (props: NodeProps<Node, T | T[]>) => T
  }
  content: Node | JSONContent
  extensions: Extensions
  options?: Partial<TiptapStaticRendererOptions<T, Mark, Node>>
}): T {
  // get all extensions in order & split them into nodes and marks
  extensions = resolveExtensions(extensions)
  const extensionAttributes = getAttributesFromExtensions(extensions)
  const { nodeExtensions, markExtensions } = splitExtensions(extensions)

  if (!(content instanceof Node)) {
    content = Node.fromJSON(getSchemaByResolvedExtensions(extensions), content)
  }

  return renderer({
    ...options,
    nodeMapping: {
      ...Object.fromEntries(
        nodeExtensions
          .filter(e => {
            if (e.name in mapDefinedTypes) {
              // These are predefined types that we don't need to map
              return false
            }
            // No need to generate mappings for nodes that are already mapped
            if (options?.nodeMapping) {
              return !(e.name in options.nodeMapping)
            }
            return true
          })
          .map(nodeExtension =>
            mapNodeExtensionToReactNode<T>(
              domOutputSpecToElement,
              nodeExtension,
              extensionAttributes,
              options,
            ),
          ),
      ),
      ...mapDefinedTypes,
      ...options?.nodeMapping,
    },
    markMapping: {
      ...Object.fromEntries(
        markExtensions
          .filter(e => {
            // No need to generate mappings for marks that are already mapped
            if (options?.markMapping) {
              return !(e.name in options.markMapping)
            }
            return true
          })
          .map(mark =>
            mapMarkExtensionToReactNode<T>(
              domOutputSpecToElement,
              mark,
              extensionAttributes,
              options,
            ),
          ),
      ),
      ...options?.markMapping,
    },
  })({ content })
}
