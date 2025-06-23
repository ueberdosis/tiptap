import { Editor } from '@tiptap/core'
import { Node } from '@tiptap/pm/model'
import { EditorState } from '@tiptap/pm/state'
import { KatexOptions } from 'katex'

export type MathematicsOptions = {
  regex: RegExp,
  katexOptions?: KatexOptions,
  shouldRender: (state: EditorState, pos: number, node: Node) => boolean,
}

export type MathematicsOptionsWithEditor = MathematicsOptions & { editor: Editor }
