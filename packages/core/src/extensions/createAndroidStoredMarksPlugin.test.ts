import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Italic from '@tiptap/extension-italic'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import type { Transaction } from '@tiptap/pm/state'
import { TextSelection } from '@tiptap/pm/state'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { Editor } from '../Editor.js'

let editor: Editor

function createEditor(content = '<p>prose</p>', android = true, enabled = true) {
  vi.stubGlobal('navigator', { userAgent: android ? 'Android' : 'Linux' })
  editor = new Editor({
    extensions: [Document, Paragraph, Text, Bold, Italic],
    content,
    enableCoreExtensions: { keymap: enabled },
  })
  editor.commands.setTextSelection(editor.state.doc.content.size - 1)
  return editor
}

function reconcile(text: string, from = 1, to = editor.state.doc.content.size - 1) {
  editor.view.dom.dispatchEvent(new CompositionEvent('compositionupdate'))
  editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, from)))
  const transaction = editor.state.tr.insertText(text, from, to).setMeta('composition', 1)

  transaction.setSelection(TextSelection.create(transaction.doc, from + text.length))
  editor.view.dispatch(transaction)
}

afterEach(() => {
  editor?.destroy()
  vi.unstubAllGlobals()
})

describe('Android stored marks during composition', () => {
  it('preserves toggled marks after composition reconciles its selection', () => {
    createEditor()
    editor.commands.toggleBold()

    reconcile('prosemirror')

    expect(editor.getHTML()).toBe('<p>prose<strong>mirror</strong></p>')
  })

  it('restores marks removed from previously composed text', () => {
    createEditor()
    editor.commands.toggleBold()
    reconcile('prosemirror')
    reconcile('prosemirrors')

    expect(editor.getHTML()).toBe('<p>prose<strong>mirrors</strong></p>')
  })

  it('keeps multiple marks', () => {
    createEditor()
    editor.commands.toggleBold()
    editor.commands.toggleItalic()

    reconcile('prosemirror')

    expect(editor.getHTML()).toBe('<p>prose<strong><em>mirror</em></strong></p>')
  })

  it('preserves requested mark attributes', () => {
    vi.stubGlobal('navigator', { userAgent: 'Android' })
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Bold.extend({
          addAttributes: () => ({ tone: { default: 'normal', renderHTML: () => ({}) } }),
        }),
      ],
      content: '<p>prose</p>',
    })
    editor.commands.setTextSelection(6)
    editor.commands.setMark('bold', { tone: 'accent' })
    reconcile('prosemirror')

    expect(editor.state.doc.firstChild?.lastChild?.marks[0].attrs.tone).toBe('accent')
    expect(editor.state.doc.firstChild?.firstChild?.marks).toEqual([])
  })
})

describe('Android successive mark toggles', () => {
  it('preserves earlier formatted characters after toggling the mark off', () => {
    createEditor()
    editor.commands.toggleBold()
    reconcile('prosemirror')
    editor.commands.toggleBold()
    reconcile('prosemirrors')

    expect(editor.getHTML()).toBe('<p>prose<strong>mirror</strong>s</p>')
  })

  it('preserves multiple mark sets across whole-word replacements', () => {
    createEditor()
    editor.commands.toggleBold()
    reconcile('prosemirror')
    editor.commands.toggleItalic()
    reconcile('prosemirrors')
    editor.commands.toggleBold()
    reconcile('prosemirrorsx')

    expect(editor.getHTML()).toBe('<p>prose<strong>mirror<em>s</em></strong><em>x</em></p>')
  })

  it('restores earlier mark intervals after the keyboard temporarily deletes its word', () => {
    createEditor()
    editor.commands.toggleBold()
    reconcile('prosemirror')
    editor.commands.toggleBold()
    editor.view.dom.dispatchEvent(new CompositionEvent('compositionupdate'))
    editor.view.dispatch(
      editor.state.tr.delete(1, editor.state.doc.content.size - 1).setMeta('composition', 1),
    )
    reconcile('prosemirrors', 1, 1)

    expect(editor.getHTML()).toBe('<p>prose<strong>mirror</strong>s</p>')
  })
})

describe('Android stored mark boundaries', () => {
  it('maps surviving formatting boundaries through earlier insertions', () => {
    createEditor('<p><strong>pro</strong>se</p>')
    editor.commands.toggleItalic()
    const transaction = editor.state.tr
      .replaceWith(2, 2, editor.schema.text('X', [editor.schema.marks.bold.create()]))
      .replaceWith(7, 7, editor.schema.text('!'))

    transaction.setSelection(TextSelection.create(transaction.doc, 8))
    editor.view.dispatch(transaction.setMeta('composition', 1))

    expect(editor.getHTML()).toBe('<p><strong>pXro</strong>se<em>!</em></p>')
  })

  it.each(['', '!'])(
    'keeps the toggle boundary across a shared suffix and subsequent insertion "%s"',
    suffix => {
      createEditor('<p><strong>pro</strong>se</p>')
      editor.commands.toggleItalic()
      editor.view.dom.dispatchEvent(new CompositionEvent('compositionupdate'))
      const transaction = editor.state.tr.replaceWith(1, 4, editor.schema.text('proseca'))

      if (suffix) {
        transaction.insertText(suffix, 10)
      }

      transaction.setSelection(TextSelection.create(transaction.doc, 10 + suffix.length))
      editor.view.dispatch(transaction.setMeta('composition', 1))

      expect(editor.getHTML()).toBe(`<p><strong>pro</strong>se<em>case${suffix}</em></p>`)
    },
  )

  it.each(['mirror', 'e'])(
    'preserves mixed prefix formatting when composing the suffix %s',
    suffix => {
      createEditor('<p><strong>pro</strong>se</p>')
      editor.commands.toggleItalic()

      editor.view.dom.dispatchEvent(new CompositionEvent('compositionupdate'))
      const transaction = editor.state.tr.replaceWith(1, 6, editor.schema.text(`prose${suffix}`))

      transaction.setSelection(TextSelection.create(transaction.doc, 6 + suffix.length))
      editor.view.dispatch(transaction.setMeta('composition', 1))

      expect(editor.getHTML()).toBe(`<p><strong>pro</strong>se<em>${suffix}</em></p>`)
    },
  )

  it('restores mixed prefix marks after temporary composition deletion', () => {
    createEditor('<p><strong>pro</strong>se</p>')
    editor.commands.toggleItalic()
    editor.view.dom.dispatchEvent(new CompositionEvent('compositionupdate'))
    editor.view.dispatch(editor.state.tr.delete(1, 6).setMeta('composition', 1))
    reconcile('prosemirror', 1, 1)

    expect(editor.getHTML()).toBe('<p><strong>pro</strong>se<em>mirror</em></p>')
  })

  it('uses the composition caret to distinguish an insertion inside repeated text', () => {
    createEditor('<p>aaaa</p>')
    editor.commands.setTextSelection(3)
    editor.commands.toggleBold()
    editor.view.dom.dispatchEvent(new CompositionEvent('compositionupdate'))
    editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, 1)))
    const transaction = editor.state.tr.insertText('aaaaa', 1, 5)

    transaction.setSelection(TextSelection.create(transaction.doc, 4))
    editor.view.dispatch(transaction.setMeta('composition', 1))

    expect(editor.getHTML()).toBe('<p>aa<strong>a</strong>aa</p>')
    expect(editor.state.selection.from).toBe(4)
  })

  it('formats an appended character that matches the existing suffix', () => {
    createEditor()
    editor.commands.toggleBold()
    reconcile('prosee')

    expect(editor.getHTML()).toBe('<p>prose<strong>e</strong></p>')
  })

  it('does not apply a toggle to corrected text before its boundary', () => {
    createEditor()
    editor.commands.toggleBold()
    reconcile('prasemirror')

    expect(editor.getHTML()).toBe('<p>prase<strong>mirror</strong></p>')
  })

  it('keeps the toggle boundary at the end of a word that composition shortens', () => {
    createEditor()
    editor.commands.toggleItalic()
    reconcile('rose')
    reconcile('roses')

    expect(editor.getHTML()).toBe('<p>rose<em>s</em></p>')

    reconcile('rosesx')

    expect(editor.getHTML()).toBe('<p>rose<em>sx</em></p>')
  })

  it('follows an autocorrection that adds a character before the toggle', () => {
    createEditor('<p>helo</p>')
    editor.commands.toggleBold()
    editor.view.dom.dispatchEvent(new CompositionEvent('compositionupdate'))
    // Gboard sends the correction and the typed space as one change
    const transaction = editor.state.tr.insertText('lo ', 4, 5)

    transaction.setSelection(TextSelection.create(transaction.doc, 7))
    editor.view.dispatch(transaction.setMeta('composition', 1))

    expect(editor.getHTML()).toBe('<p>hello<strong> </strong></p>')
  })

  it('follows an autocorrection when the keyboard replaces the whole word', () => {
    createEditor('<p>helo</p>')
    editor.commands.toggleBold()
    reconcile('hello!')

    expect(editor.getHTML()).toBe('<p>hello<strong>!</strong></p>')
  })

  it('keeps the toggle boundary after an emoji in rewritten text', () => {
    createEditor('<p><strong>a</strong>😀</p>')
    editor.commands.toggleItalic()
    reconcile('a😀b')

    expect(editor.getHTML()).toBe('<p><strong>a</strong>😀<em>b</em></p>')
  })

  it('preserves the boundary while a keyboard deletes and restores its word', () => {
    createEditor()
    editor.commands.toggleBold()
    editor.view.dom.dispatchEvent(new CompositionEvent('compositionupdate'))
    editor.view.dispatch(editor.state.tr.delete(1, 6).setMeta('composition', 1))
    reconcile('prosemirror', 1, 1)

    expect(editor.getHTML()).toBe('<p>prose<strong>mirror</strong></p>')
  })

  it('preserves an explicit mark removal without stripping earlier text', () => {
    createEditor('<p><strong>prose</strong></p>')
    editor.commands.toggleBold()

    editor.view.dom.dispatchEvent(new CompositionEvent('compositionupdate'))
    editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, 1)))
    editor.view.dispatch(
      editor.state.tr
        .replaceWith(1, 6, editor.schema.text('prosemirror', [editor.schema.marks.bold.create()]))
        .setMeta('composition', 1),
    )

    expect(editor.getHTML()).toBe('<p><strong>prose</strong>mirror</p>')
  })
})

describe('Android stored mark lifetime', () => {
  it('clears pending marks on deliberate selection changes', async () => {
    createEditor()
    editor.commands.toggleBold()
    reconcile('prosemirror')
    await new Promise(resolve => setTimeout(resolve, 0))
    editor.commands.setTextSelection(1)
    reconcile('xprosemirror')

    expect(editor.getHTML()).toBe('<p>xprosemirror</p>')
  })

  it('does not format remote or programmatic text changes', () => {
    createEditor()
    editor.commands.toggleBold()
    editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, 1)))
    editor.view.dispatch(editor.state.tr.insertText('remote', 1, 6))

    expect(editor.getHTML()).toBe('<p>remote</p>')
  })

  it('clears pending marks when the editor loses focus', () => {
    createEditor()
    editor.commands.toggleBold()
    editor.view.dom.dispatchEvent(new FocusEvent('blur'))
    reconcile('prosemirror')

    expect(editor.getHTML()).toBe('<p>prosemirror</p>')
  })

  it('clears pending marks on pointerdown', () => {
    createEditor()
    editor.commands.toggleBold()
    editor.view.dom.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    reconcile('prosemirror')

    expect(editor.getHTML()).toBe('<p>prosemirror</p>')
  })

  it('does not dispatch on blur or pointerdown without pending marks', () => {
    createEditor()
    const transactions: Transaction[] = []

    editor.on('transaction', ({ transaction }) => transactions.push(transaction))
    editor.view.dom.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    editor.view.dom.dispatchEvent(new FocusEvent('blur'))

    // Ignore the blur transaction that the core focus events extension dispatches
    expect(transactions.filter(transaction => !transaction.getMeta('blur'))).toEqual([])
  })

  it('does not carry intent across a remote change during composition', () => {
    createEditor()
    editor.commands.toggleBold()
    editor.view.dom.dispatchEvent(new CompositionEvent('compositionupdate'))
    editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, 1)))
    editor.view.dispatch(editor.state.tr.insertText('remote', 1, 6))
    reconcile('remoteword')

    expect(editor.getHTML()).toBe('<p>remoteword</p>')
  })
})

describe('Android stored mark activation', () => {
  it('allows disabling the workaround', () => {
    createEditor('<p>prose</p>', true, false)
    editor.commands.toggleBold()
    reconcile('prosemirror')

    expect(editor.getHTML()).toBe('<p>prosemirror</p>')
  })

  it('does not affect non-Android editors', () => {
    createEditor('<p>prose</p>', false)
    editor.commands.toggleBold()

    reconcile('prosemirror')

    expect(editor.getHTML()).toBe('<p>prosemirror</p>')
  })
})
