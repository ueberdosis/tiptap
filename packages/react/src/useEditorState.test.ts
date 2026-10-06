import { act, render } from '@testing-library/react'
import { Editor, Mark } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { TextSelection } from '@tiptap/pm/state'
import React from 'react'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { useEditorState } from './useEditorState.js'

const createTestEditor = () => {
  return new Editor({
    extensions: [Document, Paragraph, Text],
    content: '<p>Hello</p>',
  })
}

const EditableIndicator = ({ editor }: { editor: Editor }) => {
  const isEditable = useEditorState({
    editor,
    selector: ctx => ctx.editor.isEditable,
  })

  return React.createElement('div', { 'data-testid': 'editable-state' }, String(isEditable))
}

const ContentIndicator = ({ editor }: { editor: Editor }) => {
  const text = useEditorState({
    editor,
    selector: ctx => ctx.editor.getText(),
  })

  return React.createElement('div', { 'data-testid': 'content-state' }, text)
}

const TransactionCountIndicator = ({ editor }: { editor: Editor }) => {
  const transactionNumber = useEditorState({
    editor,
    selector: ctx => ctx.transactionNumber,
  })

  return React.createElement('div', { 'data-testid': 'tx-number' }, String(transactionNumber))
}

describe('useEditorState', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('re-renders when editor.setEditable() toggles the editable state', () => {
    const editor = createTestEditor()
    const { getByTestId } = render(React.createElement(EditableIndicator, { editor }))

    expect(getByTestId('editable-state').textContent).toBe('true')

    act(() => {
      editor.setEditable(false)
    })

    expect(getByTestId('editable-state').textContent).toBe('false')

    act(() => {
      editor.setEditable(true)
    })

    expect(getByTestId('editable-state').textContent).toBe('true')

    editor.destroy()
  })

  it('still re-renders on a normal content-changing transaction (regression)', () => {
    const editor = createTestEditor()
    const { getByTestId } = render(React.createElement(ContentIndicator, { editor }))

    expect(getByTestId('content-state').textContent).toBe('Hello')

    act(() => {
      editor.commands.setContent('<p>World</p>')
    })

    expect(getByTestId('content-state').textContent).toBe('World')

    editor.destroy()
  })

  it('notifies once per document change (transaction + update are deduped)', () => {
    const editor = createTestEditor()
    const { getByTestId } = render(React.createElement(TransactionCountIndicator, { editor }))

    const before = Number(getByTestId('tx-number').textContent)

    act(() => {
      // A single doc-changing transaction emits both `transaction` and `update`.
      editor.view.dispatch(editor.state.tr.insertText('!'))
    })

    const after = Number(getByTestId('tx-number').textContent)

    expect(after - before).toBe(1)

    editor.destroy()
  })

  it('still notifies on selection-only transactions (which emit no update event)', () => {
    const editor = createTestEditor()
    const { getByTestId } = render(React.createElement(TransactionCountIndicator, { editor }))

    const before = Number(getByTestId('tx-number').textContent)

    act(() => {
      editor.view.dispatch(editor.state.tr.setSelection(TextSelection.atStart(editor.state.doc)))
    })

    const after = Number(getByTestId('tx-number').textContent)

    expect(after - before).toBe(1)

    editor.destroy()
  })

  it('does not overflow the stack when the selected state holds circular references', () => {
    const Bold = Mark.create({
      name: 'bold',
      parseHTML: () => [{ tag: 'strong' }],
      renderHTML: () => ['strong', 0],
    })
    const Code = Mark.create({
      name: 'code',
      excludes: '_',
      parseHTML: () => [{ tag: 'code' }],
      renderHTML: () => ['code', 0],
    })
    const editor = new Editor({
      extensions: [Document, Paragraph, Text, Bold, Code],
      content: '<p>Hello</p>',
    })
    const StateIndicator = () => {
      const state = useEditorState({ editor, selector: ctx => ctx.editor.state })

      return React.createElement(
        'div',
        { 'data-testid': 'stored-marks' },
        String(state.storedMarks?.length ?? 0),
      )
    }
    const { getByTestId } = render(React.createElement(StateIndicator))

    act(() => {
      editor.chain().setTextSelection(3).toggleMark('bold').run()
    })
    act(() => {
      editor.chain().toggleMark('code').run()
    })

    expect(getByTestId('stored-marks').textContent).toBe('1')

    editor.destroy()
  })
})
