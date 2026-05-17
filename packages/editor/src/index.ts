/**
 * `@tiptap/editor` root entrypoint.
 *
 * Exports the core editor APIs, common utilities, and types. Nodes, marks,
 * extensions, kits, and framework adapters are intentionally NOT exported
 * from here — import them from their dedicated subpaths instead:
 *
 *   import { Heading } from '@tiptap/editor/nodes/heading'
 *   import { Link } from '@tiptap/editor/marks/link'
 *   import { Placeholder } from '@tiptap/editor/extensions/placeholder'
 *   import { StarterKit } from '@tiptap/editor/kits/starter'
 *   import { useEditor, EditorContent } from '@tiptap/editor/react'
 *
 * The default `Editor` exported here automatically registers Document,
 * Paragraph, and Text. Replace them by passing a same-named node in
 * `extensions`, or import the unwrapped class from `@tiptap/core`.
 */

// Re-export the full core surface: Extension, Node, Mark, Extendable,
// commands, helpers, utilities, types, mergeAttributes, findChildren, etc.
// The local `Editor` export below shadows the one re-exported here, so
// consumers get the defaults-enabled variant unless they reach for
// `@tiptap/core` directly.
export { Editor, withDefaultCoreNodes } from './editor.js'
export * from '@tiptap/core'
