import { Editor } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Code from '@tiptap/extension-code'
import CodeBlock from '@tiptap/extension-code-block'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { UndoRedo } from '@tiptap/extensions'
import { afterEach, describe, expect, it } from 'vitest'

describe('can', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('not undo', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, UndoRedo],
    })

    const canUndo = editor.can().undo()

    expect(canUndo).toBe(false)
  })

  it('undo', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, UndoRedo],
    })

    editor.commands.setContent('foo')

    const canUndo = editor.can().undo()

    expect(canUndo).toBe(true)
  })

  it('not chain undo', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, UndoRedo],
    })

    const canUndo = editor.can().chain().undo().run()

    expect(canUndo).toBe(false)
  })

  it('chain undo', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, UndoRedo],
    })

    editor.commands.setContent('foo')

    const canUndo = editor.can().chain().undo().run()

    expect(canUndo).toBe(true)
  })

  it('returns false for non-applicable marks when cursor is positioned in node that disallows marks', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, UndoRedo, CodeBlock, Bold],
    })

    // Set up a code block and position cursor inside it (no selection)
    editor
      .chain()
      .setCodeBlock()
      .insertContent('Test code block')
      .setTextSelection(5) // Position cursor in the middle of the text
      .run()

    const canSetMarkToBold = editor.can().setMark('bold')

    expect(canSetMarkToBold).toBe(false)
  })

  it('returns false for non-applicable marks when selection contains node in conflict', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, UndoRedo, CodeBlock, Bold],
    })

    editor
      .chain()
      .setCodeBlock()
      .insertContent('Test code block')
      .setTextSelection({ from: 2, to: 3 })
      .selectAll()
      .run()

    const canSetMarkToBold = editor.can().setMark('bold')

    expect(canSetMarkToBold).toBe(false)
  })

  it('returns false for non-applicable marks when selection contains marks in conflict', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, UndoRedo, Code, Bold],
    })

    editor.chain().setContent('<code>test</code>').setTextSelection({ from: 2, to: 3 }).run()

    const canSetMarkToBold = editor.can().setMark('bold')

    expect(canSetMarkToBold).toBe(false)
  })

  it('returns false for non-applicable marks when stored marks in conflict', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, UndoRedo, Code, Bold],
    })

    editor.chain().setContent('<code>test</code>').run()

    const canSetMarkToBold = editor.can().setMark('bold')

    expect(canSetMarkToBold).toBe(false)
  })

  it('returns false for non-applicable marks when selecting multiple nodes in conflict', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, UndoRedo, Code, Bold],
    })

    editor.chain().setContent('<code>test</code><code>123</code>').selectAll().run()

    const canSetMarkToBold = editor.can().setMark('bold')

    expect(canSetMarkToBold).toBe(false)
  })

  it('returns true for applicable marks when selection does not contain nodes in conflict', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, UndoRedo, CodeBlock, Bold],
    })

    editor
      .chain()
      .setCodeBlock()
      .insertContent('Test code block')
      .exitCode()
      .insertContent('Additional paragraph node')
      .selectAll()
      .run()

    const canSetMarkToBold = editor.can().setMark('bold')

    expect(canSetMarkToBold).toBe(true)
  })

  it('returns true for applicable marks when stored marks are not in conflict', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, UndoRedo, Code, Bold],
    })

    editor.chain().setContent('<code>test</code>').toggleCode().run()

    const canSetMarkToBold = editor.can().setMark('bold')

    expect(canSetMarkToBold).toBe(true)
  })

  it('returns true for applicable marks when selection does not contain marks in conflict', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, UndoRedo, Code, Bold],
    })

    editor.chain().setContent('<code>test</code>').setTextSelection({ from: 2, to: 3 }).toggleCode().run()

    const canSetMarkToBold = editor.can().setMark('bold')

    expect(canSetMarkToBold).toBe(true)
  })

  it('returns true for applicable marks if at least one node in selection has no marks in conflict', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, UndoRedo, Code, Bold],
    })

    editor.chain().setContent('<code>test</code><i>123</i>').selectAll().run()

    const canSetMarkToBold = editor.can().setMark('bold')

    expect(canSetMarkToBold).toBe(true)
  })

  it('builds and passes down an undefined dispatch for nested "can" chain', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, UndoRedo],
    })

    let capturedOuterDispatch: ((args?: any) => any) | undefined
    let capturedInnerDispatch: ((args?: any) => any) | undefined

    editor
      .can()
      .chain()
      .command(({ chain, dispatch: outterDispatch }) => {
        capturedOuterDispatch = outterDispatch
        return chain()
          .command(({ dispatch: innerDispatch }) => {
            capturedInnerDispatch = innerDispatch
            return true
          })
          .run()
      })
      .run()

    expect(capturedOuterDispatch).toBe(undefined)
    expect(capturedInnerDispatch).toBe(undefined)
  })
})
