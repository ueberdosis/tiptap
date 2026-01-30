import type { Editor } from '@tiptap/core'
import type { EditorStateSnapshot } from '@tiptap/react'

/**
 * State selector for the MenuBar component.
 * Extracts the relevant editor state for rendering menu buttons.
 */
export function menuBarStateSelector(ctx: EditorStateSnapshot<Editor>) {
  return {
    // Text formatting
    isBold: ctx.editor.isActive('bold') ?? false,
    canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
    isItalic: ctx.editor.isActive('italic') ?? false,
    canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
    isStrike: ctx.editor.isActive('strike') ?? false,
    canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
    isCode: ctx.editor.isActive('code') ?? false,
    canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
    canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,

    // Block types
    isParagraph: ctx.editor.isActive('paragraph') ?? false,
    isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
    isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
    isHeading3: ctx.editor.isActive('heading', { level: 3 }) ?? false,
    isHeading4: ctx.editor.isActive('heading', { level: 4 }) ?? false,
    isHeading5: ctx.editor.isActive('heading', { level: 5 }) ?? false,
    isHeading6: ctx.editor.isActive('heading', { level: 6 }) ?? false,

    // Lists and blocks
    isBulletList: ctx.editor.isActive('bulletList') ?? false,
    isOrderedList: ctx.editor.isActive('orderedList') ?? false,
    isCodeBlock: ctx.editor.isActive('codeBlock') ?? false,
    isBlockquote: ctx.editor.isActive('blockquote') ?? false,

    // History
    canUndo: ctx.editor.can().chain().undo().run() ?? false,
    canRedo: ctx.editor.can().chain().redo().run() ?? false,
  }
}

export type MenuBarState = ReturnType<typeof menuBarStateSelector>
