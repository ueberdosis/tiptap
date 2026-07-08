import { act } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { renderTiptapEditor as renderEditor, unmountTrackedRoots } from './helpers.js'

afterEach(unmountTrackedRoots)

interface InputEventOptions {
  inputType: string
  data?: string
  ranges?: StaticRange[]
}

const fireBeforeInput = (target: HTMLElement, { inputType, data, ranges }: InputEventOptions) => {
  const event = new InputEvent('beforeinput', {
    inputType,
    data,
    bubbles: true,
    cancelable: true,
  })

  if (ranges) {
    Object.defineProperty(event, 'getTargetRanges', { value: () => ranges })
  }
  target.dispatchEvent(event)
  return event
}

const staticRange = (node: globalThis.Node, start: number, end: number): StaticRange =>
  ({
    startContainer: node,
    startOffset: start,
    endContainer: node,
    endOffset: end,
    collapsed: start === end,
  }) as StaticRange

describe('beforeInput plugin', () => {
  it('inserts typed text at the selection and prevents the native edit', async () => {
    const { editor, dom } = await renderEditor('<p>foo</p>')

    await act(async () => {
      editor.commands.setTextSelection(2)
    })

    let event: Event | undefined

    await act(async () => {
      event = fireBeforeInput(dom, { inputType: 'insertText', data: 'x' })
    })

    expect(event?.defaultPrevented).toBe(true)
    expect(editor.state.doc.textContent).toBe('fxoo')
    expect(dom.innerHTML).toBe('<p>fxoo</p>')
  })

  it('inserts text into the event target range when provided', async () => {
    const { editor, dom } = await renderEditor('<p>foo</p>')
    const text = dom.children[0].firstChild as Text

    await act(async () => {
      fireBeforeInput(dom, {
        inputType: 'insertText',
        data: 'X',
        ranges: [staticRange(text, 1, 3)],
      })
    })

    expect(editor.state.doc.textContent).toBe('fX')
    expect(dom.innerHTML).toBe('<p>fX</p>')
  })

  it('splits the paragraph on insertParagraph via the keymap', async () => {
    const { editor, dom } = await renderEditor('<p>foo</p>')

    await act(async () => {
      editor.commands.setTextSelection(2)
    })
    await act(async () => {
      fireBeforeInput(dom, { inputType: 'insertParagraph' })
    })

    expect(dom.innerHTML).toBe('<p>f</p><p>oo</p>')
  })

  it('deletes the target range on deleteContentBackward', async () => {
    const { editor, dom } = await renderEditor('<p>foo</p>')
    const text = dom.children[0].firstChild as Text

    await act(async () => {
      fireBeforeInput(dom, {
        inputType: 'deleteContentBackward',
        ranges: [staticRange(text, 2, 3)],
      })
    })

    expect(editor.state.doc.textContent).toBe('fo')
    expect(dom.innerHTML).toBe('<p>fo</p>')
  })

  it('maps later target ranges through earlier deletes in one event', async () => {
    const { editor, dom } = await renderEditor('<p>abcdef</p>')
    const text = dom.children[0].firstChild as Text

    // Two ranges of the same event: "ab" (1-3) and "ef" (5-7)
    await act(async () => {
      fireBeforeInput(dom, {
        inputType: 'deleteContentBackward',
        ranges: [staticRange(text, 0, 2), staticRange(text, 4, 6)],
      })
    })

    expect(editor.state.doc.textContent).toBe('cd')
    expect(dom.innerHTML).toBe('<p>cd</p>')
  })

  it('applies insertReplacementText carried on event.data', async () => {
    const { editor, dom } = await renderEditor('<p>teh cat</p>')
    const text = dom.children[0].firstChild as Text

    await act(async () => {
      fireBeforeInput(dom, {
        inputType: 'insertReplacementText',
        data: 'the',
        ranges: [staticRange(text, 0, 3)],
      })
    })

    expect(editor.state.doc.textContent).toBe('the cat')
  })

  it('ignores input while the editor is not editable', async () => {
    const { editor, dom } = await renderEditor('<p>foo</p>')

    await act(async () => {
      editor.setEditable(false)
    })

    expect(dom.getAttribute('contenteditable')).toBe('false')

    let event: Event | undefined

    await act(async () => {
      event = fireBeforeInput(dom, { inputType: 'insertText', data: 'x' })
    })

    expect(event?.defaultPrevented).toBe(false)
    expect(editor.state.doc.textContent).toBe('foo')
  })

  it('leaves composition input alone', async () => {
    const { dom } = await renderEditor('<p>foo</p>')

    let event: Event | undefined

    await act(async () => {
      event = fireBeforeInput(dom, { inputType: 'insertFromComposition', data: 'x' })
    })

    expect(event?.defaultPrevented).toBe(false)
  })
})
