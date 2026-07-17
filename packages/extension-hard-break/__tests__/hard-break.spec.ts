import { Editor } from '@tiptap/core'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'
import type { Transaction } from '@tiptap/pm/state'

import { HardBreak } from '../src/hard-break.js'

describe('HardBreak', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
  })

  it('scrolls the selection into view when adding a hard break', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, HardBreak],
      content: '<p>hello</p>',
    })

    editor.commands.setTextSelection(6)

    let lastTr: Transaction
    const origDispatch = editor.view.dispatch.bind(editor.view)

    editor.view.dispatch = (tr: Transaction) => {
      lastTr = tr
      return origDispatch(tr)
    }

    editor.commands.setHardBreak()

    expect(lastTr!).toBeDefined()
    expect(lastTr!.scrolledIntoView).toBe(true)
  })

  it('scrolls the selection into view when pressing Shift+Enter', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, HardBreak],
      content: '<p>hello</p>',
    })

    editor.commands.setTextSelection(6)

    let lastTr: Transaction
    const origDispatch = editor.view.dispatch.bind(editor.view)

    editor.view.dispatch = (tr: Transaction) => {
      lastTr = tr
      return origDispatch(tr)
    }

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      shiftKey: true,
    })
    editor.view.dispatchEvent(event)

    expect(lastTr!).toBeDefined()
    expect(lastTr!.scrolledIntoView).toBe(true)
    expect(editor.getHTML()).toBe('<p>hello<br></p>')
  })

  it('inserts a hardbreak into a document', () => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, HardBreak],
      content: '<p>hello</p>',
    })

    editor.commands.setTextSelection(6)
    editor.commands.setHardBreak()

    expect(editor.getHTML()).toBe('<p>hello<br></p>')
  })
})
