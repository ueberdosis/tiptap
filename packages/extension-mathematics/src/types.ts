import type { Editor } from '@tiptap/core'
import type { Node } from '@tiptap/pm/model'
import type { EditorState } from '@tiptap/pm/state'
import type { KatexOptions } from 'katex'

export type MathematicsOptions = {
  regex: RegExp
  katexOptions?: KatexOptions
  shouldRender: (state: EditorState, pos: number, node: Node) => boolean
}

export type MathematicsOptionsWithEditor = MathematicsOptions & { editor: Editor }
