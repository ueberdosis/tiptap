import { act, createElement } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { EditorContent } from '../components/EditorContent.js'
import { HighlightExtension, renderTiptapEditor, unmountTrackedRoots } from './helpers.js'

afterEach(unmountTrackedRoots)

/**
 * jsdom has no IME, so these tests replay what a browser does: fire the
 * composition events, mutate the text node directly (browser-owned preedit),
 * and assert that state and DOM converge afterwards.
 */

const fireComposition = (dom: HTMLElement, type: string, data?: string) => {
  const event = new Event(type, { bubbles: true, cancelable: true })

  // jsdom's CompositionEvent stub drops `data`; define it directly
  Object.defineProperty(event, 'data', { value: data })
  dom.dispatchEvent(event)
  return event
}

const firePreedit = (dom: HTMLElement, data: string, ranges?: StaticRange[]) => {
  const event = new InputEvent('beforeinput', {
    inputType: 'insertCompositionText',
    data,
    bubbles: true,
  })

  if (ranges) {
    Object.defineProperty(event, 'getTargetRanges', { value: () => ranges })
  }
  dom.dispatchEvent(event)
}

/** `<p>foo</p>` with the selection already placed. */
const mountFoo = async (
  selection: number | { from: number; to: number } = 2,
  extensions: Parameters<typeof renderTiptapEditor>[1] = [],
) => {
  const mounted = await renderTiptapEditor('<p>foo</p>', extensions)

  await act(async () => {
    mounted.editor.commands.setTextSelection(selection)
  })
  return mounted
}

/** Starts a composition and mutates the text node like the browser would. */
const composePreedit = (dom: HTMLElement, preedit: string, mutatedText?: string) =>
  act(async () => {
    fireComposition(dom, 'compositionstart')
    fireComposition(dom, 'compositionupdate', preedit)
    firePreedit(dom, preedit)
    if (mutatedText !== undefined) {
      ;(dom.children[0].firstChild as Text).data = mutatedText
    }
  })

const endComposition = (dom: HTMLElement, data?: string) =>
  act(async () => {
    fireComposition(dom, 'compositionend', data)
  })

describe('composition plugin', () => {
  it('commits composed text into the state at compositionend', async () => {
    const { editor, view, dom } = await mountFoo()

    await composePreedit(dom, 'あ', 'fあoo')

    // Mid-composition: browser owns the DOM, state untouched, React frozen
    expect(view.composing).toBe(true)
    expect(editor.state.doc.textContent).toBe('foo')
    expect(dom.innerHTML).toBe('<p>fあoo</p>')

    await endComposition(dom, 'あ')

    expect(view.composing).toBe(false)
    expect(editor.state.doc.textContent).toBe('fあoo')
    expect(dom.innerHTML).toBe('<p>fあoo</p>')
    expect(editor.state.selection.from).toBe(3)
  })

  it('repairs the DOM after a cancelled composition', async () => {
    const { editor, dom } = await mountFoo()

    // Simulate an engine that leaves the preedit behind on cancel
    await composePreedit(dom, 'あ', 'fあoo')
    await endComposition(dom, '')

    expect(editor.state.doc.textContent).toBe('foo')
    expect(dom.innerHTML).toBe('<p>foo</p>')
  })

  it('replaces a non-collapsed selection with the composed text', async () => {
    const { editor, dom } = await mountFoo({ from: 2, to: 4 })

    await composePreedit(dom, 'あ')
    await endComposition(dom, 'あ')

    expect(editor.state.doc.textContent).toBe('fあ')
    expect(dom.innerHTML).toBe('<p>fあ</p>')
  })

  it('deletes the selection when a composition over it is cancelled', async () => {
    const { editor, dom } = await mountFoo({ from: 2, to: 4 })

    await act(async () => {
      fireComposition(dom, 'compositionstart')
    })
    await endComposition(dom, '')

    expect(editor.state.doc.textContent).toBe('f')
    expect(dom.innerHTML).toBe('<p>f</p>')
  })

  it('handles per-syllable IMEs committing in consecutive cycles', async () => {
    const { editor, dom } = await mountFoo()

    await composePreedit(dom, '하', 'f하oo')
    await endComposition(dom, '하')

    expect(editor.state.doc.textContent).toBe('f하oo')
    expect(editor.state.selection.from).toBe(3)

    await composePreedit(dom, '나', 'f하나oo')
    await endComposition(dom, '나')

    expect(editor.state.doc.textContent).toBe('f하나oo')
    expect(dom.innerHTML).toBe('<p>f하나oo</p>')
    expect(editor.state.selection.from).toBe(4)
  })

  it('maps the composition range through transactions arriving mid-composition', async () => {
    const { editor, dom } = await mountFoo()

    await composePreedit(dom, 'あ')
    await act(async () => {
      // A remote/collab transaction inserts before the composition range
      editor.commands.insertContentAt(1, 'X')
    })

    // React stays frozen on the pre-composition DOM
    expect(editor.state.doc.textContent).toBe('Xfoo')
    expect(dom.innerHTML).toBe('<p>foo</p>')

    await endComposition(dom, 'あ')

    expect(editor.state.doc.textContent).toBe('Xfあoo')
    expect(dom.innerHTML).toBe('<p>Xfあoo</p>')
  })

  it('does not commit staged transactions into the view mid-composition', async () => {
    const { editor, view, root, dom } = await mountFoo()

    await composePreedit(dom, 'あ', 'fあoo')
    await act(async () => {
      editor.commands.insertContentAt(1, 'X')
    })

    // A parent-triggered re-render mid-composition must not push the
    // staged state into the base view: its descs still describe the frozen
    // DOM and the update would write the DOM selection, cancelling the IME
    await act(async () => {
      root.render(createElement(EditorContent, { editor }))
    })

    expect(view.composing).toBe(true)
    expect(view.hasPendingCommit).toBe(true)
    expect(dom.innerHTML).toBe('<p>fあoo</p>')

    await endComposition(dom, 'あ')

    expect(view.hasPendingCommit).toBe(false)
    expect(editor.state.doc.textContent).toBe('Xfあoo')
    expect(dom.innerHTML).toBe('<p>Xfあoo</p>')
  })

  it('applies stored marks captured at compositionstart to the commit', async () => {
    const { editor, dom } = await mountFoo(2, [HighlightExtension])

    await act(async () => {
      editor.commands.setMark('highlight')
    })

    await composePreedit(dom, 'あ')
    await endComposition(dom, 'あ')

    const inserted = editor.state.doc.nodeAt(2)

    expect(inserted?.text).toBe('あ')
    expect(inserted?.marks.map(mark => mark.type.name)).toContain('highlight')
  })

  it('commits Safari insertFromComposition data when compositionend has none', async () => {
    const { editor, dom } = await mountFoo()

    await act(async () => {
      fireComposition(dom, 'compositionstart')
      dom.dispatchEvent(
        new InputEvent('beforeinput', {
          inputType: 'insertFromComposition',
          data: 'あ',
          bubbles: true,
          cancelable: true,
        }),
      )
    })
    await endComposition(dom)

    // Exactly one insertion, from the stashed data
    expect(editor.state.doc.textContent).toBe('fあoo')
    expect(dom.innerHTML).toBe('<p>fあoo</p>')
  })

  it('defers selection reads racing the commit until descs are fresh', async () => {
    const { editor, dom } = await mountFoo()

    await composePreedit(dom, 'あ', 'fあoo')
    await act(async () => {
      fireComposition(dom, 'compositionend', 'あ')
      // The commit is dispatched but React has not re-rendered yet; a
      // selectionchange now must not read positions from stale descs
      document.dispatchEvent(new Event('selectionchange'))
    })

    expect(editor.state.doc.textContent).toBe('fあoo')
    expect(editor.state.selection.from).toBe(3)
  })

  it('leaves synthetic compositionend events without a record to the deferral path', async () => {
    const { editor, view, dom } = await renderTiptapEditor('<p>foo</p>')

    // No compositionstart was fired: the plugin has no record and must not
    // dispatch anything (the EditorContent deferral tests rely on this)
    await act(async () => {
      fireComposition(dom, 'compositionend', 'x')
    })

    expect(view.composing).toBe(false)
    expect(editor.state.doc.textContent).toBe('foo')
  })
})
