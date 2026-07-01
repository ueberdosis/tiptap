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
import { Node, Schema } from '@tiptap/pm/model'

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

  return [
    coreExtensions.TextDirection.configure({ direction: options.textDirection }),
    ...extensions,
  ]
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

// Placeholder node/mark types injected into a copy of the schema so JSON that
// references types missing from the user's schema can still be converted by
// `Node.fromJSON`. The original type/attrs are carried on the placeholder and
// restored when it reaches `unhandledNode`/`unhandledMark`.
const UNHANDLED_NODE_TYPE = '__tiptapUnhandledNode__'
const UNHANDLED_MARK_TYPE = '__tiptapUnhandledMark__'
const ORIGINAL_TYPE_ATTR = '__originalType'
const ORIGINAL_ATTRS_ATTR = '__originalAttrs'

const placeholderAttrs = {
  [ORIGINAL_TYPE_ATTR]: { default: '' },
  [ORIGINAL_ATTRS_ATTR]: { default: {} },
}

/**
 * Returns true if `content` references any node or mark type absent from `schema`.
 */
function hasUnknownType(content: JSONContent, schema: Schema): boolean {
  let found = false

  const visit = (node: JSONContent): void => {
    if (found) {
      return
    }
    if (node.type && !(node.type in schema.nodes)) {
      found = true
    }
    node.marks?.forEach(mark => {
      if (mark.type && !(mark.type in schema.marks)) {
        found = true
      }
    })
    node.content?.forEach(visit)
  }

  visit(content)

  return found
}

/**
 * Returns a deep copy of `content` in which every node/mark type absent from
 * `schema` AND covered by a matching fallback in `options` is replaced by a
 * placeholder type carrying the original type/attrs. Unknown types without a
 * matching fallback are left untouched so `Node.fromJSON` still surfaces its clear
 * error for them.
 */
function substituteUnknownTypes(
  content: JSONContent,
  schema: Schema,
  options?: { unhandledNode?: unknown; unhandledMark?: unknown },
): JSONContent {
  const canSubstituteNode = Boolean(options?.unhandledNode)
  const canSubstituteMark = Boolean(options?.unhandledMark)

  const substituteMark = (mark: NonNullable<JSONContent['marks']>[number]) =>
    canSubstituteMark && !(mark.type in schema.marks)
      ? {
          type: UNHANDLED_MARK_TYPE,
          attrs: { [ORIGINAL_TYPE_ATTR]: mark.type, [ORIGINAL_ATTRS_ATTR]: mark.attrs ?? {} },
        }
      : mark

  const isUnknownNode = (node: JSONContent) =>
    canSubstituteNode && node.type != null && !(node.type in schema.nodes)

  const toPlaceholder = (node: JSONContent, rewritten: JSONContent): JSONContent => ({
    ...rewritten,
    type: UNHANDLED_NODE_TYPE,
    attrs: { [ORIGINAL_TYPE_ATTR]: node.type, [ORIGINAL_ATTRS_ATTR]: node.attrs ?? {} },
  })

  const substituteNode = (node: JSONContent): JSONContent => {
    const rewritten = {
      ...node,
      marks: node.marks?.map(substituteMark),
      content: node.content?.map(substituteNode),
    }
    return isUnknownNode(node) ? toPlaceholder(node, rewritten) : rewritten
  }

  return substituteNode(content)
}

/**
 * Builds a copy of `schema` with the placeholder node/mark types added, so a
 * document produced by `substituteUnknownTypes` converts cleanly.
 */
function withPlaceholderTypes(schema: Schema): Schema {
  return new Schema({
    topNode: schema.spec.topNode,
    nodes: schema.spec.nodes.addToEnd(UNHANDLED_NODE_TYPE, { attrs: placeholderAttrs }),
    marks: schema.spec.marks.addToEnd(UNHANDLED_MARK_TYPE, { attrs: placeholderAttrs }),
  })
}

/**
 * Resolves render input to a ProseMirror `Node`. A `Node` is returned as-is. JSON
 * with only known types converts directly. JSON containing types missing from the
 * schema has those types — when a matching `unhandledNode`/`unhandledMark` fallback
 * exists — swapped for placeholders before conversion, so known nodes keep their
 * materialized attributes and only the unknown ones route to the fallbacks. Unknown
 * types without a fallback, and genuinely malformed content, still throw.
 */
function resolveRenderContent(
  content: Node | JSONContent,
  extensions: Extensions,
  options?: { unhandledNode?: unknown; unhandledMark?: unknown },
): Node {
  if (content instanceof Node) {
    return content
  }

  const schema = getSchemaByResolvedExtensions(extensions)

  if (!hasUnknownType(content, schema)) {
    return Node.fromJSON(schema, content)
  }

  return Node.fromJSON(
    withPlaceholderTypes(schema),
    substituteUnknownTypes(content, schema, options),
  )
}

/**
 * Swaps a placeholder node/mark JSON back to its original type and attributes.
 * Leaves non-placeholder JSON untouched.
 */
function unwrapPlaceholderJSON(json: JSONContent): JSONContent {
  return json.type === UNHANDLED_NODE_TYPE || json.type === UNHANDLED_MARK_TYPE
    ? { ...json, type: json.attrs![ORIGINAL_TYPE_ATTR], attrs: json.attrs![ORIGINAL_ATTRS_ATTR] }
    : json
}

/**
 * Recursively restores the original JSON of a (possibly nested) placeholder
 * subtree, including placeholder marks.
 */
function restoreOriginalJSON(json: JSONContent): JSONContent {
  const node = unwrapPlaceholderJSON(json)

  return {
    ...node,
    marks: node.marks?.map(
      mark => unwrapPlaceholderJSON(mark) as NonNullable<JSONContent['marks']>[number],
    ),
    content: node.content?.map(restoreOriginalJSON),
  }
}

/**
 * Presents a placeholder node/mark to a fallback renderer under its original type
 * name and attributes — including a `toJSON()` that returns the restored original
 * JSON — while keeping the live ProseMirror children/methods intact.
 *
 * `type` is exposed as a minimal `{ name }` rather than a real `NodeType`/`MarkType`:
 * the original type is absent from the schema so no real one exists, and surfacing
 * the placeholder's own type would leak misleading `spec`/`schema`/`isInline` values.
 */
function withOriginalIdentity<T extends { attrs: Record<string, any>; toJSON: () => JSONContent }>(
  target: T,
): T {
  const overrides: Record<string | symbol, unknown> = Object.assign(Object.create(null), {
    type: { name: target.attrs[ORIGINAL_TYPE_ATTR] },
    attrs: target.attrs[ORIGINAL_ATTRS_ATTR],
    toJSON: () => restoreOriginalJSON(target.toJSON()),
  })

  return new Proxy(target, {
    get(node, prop) {
      const override = overrides[prop]
      if (override !== undefined) {
        return override
      }
      const value = (node as Record<string | symbol, unknown>)[prop]
      return typeof value === 'function' ? value.bind(node) : value
    },
  })
}

/** Maps the placeholder node type to the caller's `unhandledNode`, restoring identity. */
function placeholderNodeRenderer<T>(
  unhandledNode: (props: NodeProps<Node, T | T[]>) => T,
): (props: NodeProps<Node, T | T[]>) => T {
  return props => unhandledNode({ ...props, node: withOriginalIdentity(props.node) })
}

/** Maps the placeholder mark type to the caller's `unhandledMark`, restoring identity. */
function placeholderMarkRenderer<T>(
  unhandledMark: (props: MarkProps<Mark, T | T[], Node>) => T,
): (props: MarkProps<Mark, T | T[], Node>) => T {
  return props => unhandledMark({ ...props, mark: withOriginalIdentity(props.mark) })
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
  const {
    unhandledNode,
    unhandledMark,
    nodeMapping: userNodeMapping,
    markMapping: userMarkMapping,
  } = options ?? {}

  content = resolveRenderContent(content, extensions, options)

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
            if (userNodeMapping) {
              return !(e.name in userNodeMapping)
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
      ...userNodeMapping,
      // Route substituted unknown nodes to the caller's fallback (see resolveRenderContent).
      ...(unhandledNode
        ? { [UNHANDLED_NODE_TYPE]: placeholderNodeRenderer<T>(unhandledNode) }
        : {}),
    },
    markMapping: {
      ...Object.fromEntries(
        markExtensions
          .filter(e => {
            // No need to generate mappings for marks that are already mapped
            if (userMarkMapping) {
              return !(e.name in userMarkMapping)
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
      ...userMarkMapping,
      // Route substituted unknown marks to the caller's fallback (see resolveRenderContent).
      ...(unhandledMark
        ? { [UNHANDLED_MARK_TYPE]: placeholderMarkRenderer<T>(unhandledMark) }
        : {}),
    },
  })({ content })
}
