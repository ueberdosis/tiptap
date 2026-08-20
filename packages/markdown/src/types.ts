import type { JSONContent } from '@tiptap/core'

export type ContentType = 'json' | 'html' | 'markdown'

/** A JSON representation of a mark on an inline node. */
export type JSONMark = NonNullable<JSONContent['marks']>[number]
