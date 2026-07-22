import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vitest'

import { RubyText, type RubyTextOptions } from '../src/ruby-text.js'

let container: HTMLElement | undefined

function createEditor(content = '<p></p>', options: Partial<RubyTextOptions> = {}) {
  const element = document.createElement('div')
  document.body.appendChild(element)
  container = element

  return new Editor({
    element,
    extensions: [Document, Paragraph, Text, RubyText.configure(options)],
    content,
  })
}

describe('RubyText', () => {
  let editor: Editor

  afterEach(() => {
    editor?.destroy()
    container?.remove()
    container = undefined
  })

  it('stores base text in the document and annotation in mark attributes', () => {
    editor = createEditor('<p>漢字</p>')
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })

    expect(editor.getJSON()).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '漢字',
              marks: [{ type: 'rubyText', attrs: { rt: 'かんじ' } }],
            },
          ],
        },
      ],
    })
  })

  it('sets, toggles, and unsets the ruby mark', () => {
    editor = createEditor('<p>漢字</p>')
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })
    expect(editor.isActive('rubyText')).toBe(true)

    editor.commands.selectAll()
    editor.commands.toggleRubyText({ rt: 'かんじ' })
    expect(editor.isActive('rubyText')).toBe(false)

    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })
    editor.commands.selectAll()
    editor.commands.unsetRubyText()
    expect(editor.getHTML()).toBe('<p>漢字</p>')
  })

  it('updates the annotation on an existing mark', () => {
    editor = createEditor('<p>漢字</p>')
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ（新）' })

    expect(editor.getHTML()).toContain('かんじ（新）')
  })

  it('renders a non-editable rt element', () => {
    editor = createEditor('<p>漢字</p>')
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })

    const rt = editor.view.dom.querySelector('ruby > rt') as HTMLElement

    expect(editor.getHTML()).toContain('<rt contenteditable="false">かんじ</rt>')
    expect(rt.contentEditable).toBe('false')
    expect(rt.parentElement?.tagName).toBe('RUBY')
  })

  it('applies configured HTML attributes to the mark view', () => {
    editor = createEditor('<p>漢字</p>', { HTMLAttributes: { class: 'ruby-text' } })
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })

    expect(editor.view.dom.querySelector('ruby')?.className).toBe('ruby-text')
  })

  it('preserves an empty annotation', () => {
    editor = createEditor('<p>漢字</p>')
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: '' })

    expect(editor.getHTML()).not.toContain('data-rt')
    expect(editor.getHTML()).toContain('<rt contenteditable="false"></rt>')
  })

  it('does not render an annotation when it is null', () => {
    editor = createEditor('<p>漢字</p>')
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: null })

    expect(editor.getHTML()).toBe('<p><ruby><rb>漢字</rb></ruby></p>')
  })

  it('updates an annotation after submitting its inline editor', () => {
    editor = createEditor('<p>漢字</p>')
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })

    const rt = editor.view.dom.querySelector('ruby > rt') as HTMLElement
    rt.click()

    const input = rt.querySelector('input') as HTMLInputElement
    input.value = 'かんじ（新）'
    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }))

    expect(editor.getHTML()).toContain('かんじ（新）')
    expect(editor.view.dom.querySelector('ruby > rt')?.textContent).toBe('かんじ（新）')
    expect(editor.state.selection.from).toBe(3)
  })

  it('closes the editor when submitting an unchanged annotation', () => {
    editor = createEditor('<p>漢字</p>')
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })

    const rt = editor.view.dom.querySelector('ruby > rt') as HTMLElement
    rt.click()

    const input = rt.querySelector('input') as HTMLInputElement
    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }))

    expect(rt.querySelector('input')).toBeNull()
    expect(rt.textContent).toBe('かんじ')
    expect(editor.state.selection.from).toBe(3)
  })

  it('does not open an inline editor when click editing is disabled', () => {
    editor = createEditor('<p>漢字</p>', { allowClickToEdit: false })
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })

    const rt = editor.view.dom.querySelector('ruby > rt') as HTMLElement
    rt.click()

    expect(rt.querySelector('input')).toBeNull()
  })

  it('does not open an inline editor when the editor is not editable', () => {
    editor = createEditor('<p>漢字</p>')
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })
    editor.setEditable(false)

    const rt = editor.view.dom.querySelector('ruby > rt') as HTMLElement
    rt.click()

    expect(rt.querySelector('input')).toBeNull()
    expect(editor.getHTML()).toContain('かんじ')
  })

  it('discards an annotation edit when dismissed', () => {
    editor = createEditor('<p>漢字</p>')
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })

    const rt = editor.view.dom.querySelector('ruby > rt') as HTMLElement
    rt.click()

    const input = rt.querySelector('input') as HTMLInputElement
    input.value = 'かんじ（新）'
    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }))

    expect(editor.getHTML()).toContain('かんじ')
    expect(editor.getHTML()).not.toContain('かんじ（新）')
    expect(rt.textContent).toBe('かんじ')
    expect(editor.state.selection.from).toBe(3)
  })

  it('discards an annotation edit when it loses focus', () => {
    editor = createEditor('<p>漢字</p>')
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })

    const rt = editor.view.dom.querySelector('ruby > rt') as HTMLElement
    rt.click()

    const input = rt.querySelector('input') as HTMLInputElement
    input.value = 'かんじ（新）'
    input.blur()

    expect(editor.getHTML()).toContain('かんじ')
    expect(editor.getHTML()).not.toContain('かんじ（新）')
    expect(rt.textContent).toBe('かんじ')
    expect(editor.state.selection.from).toBe(3)
  })

  it('focuses the default input after opening the inline editor', () => {
    editor = createEditor('<p>漢字</p>')
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })

    const rt = editor.view.dom.querySelector('ruby > rt') as HTMLElement
    rt.click()

    expect(document.activeElement).toBe(rt.querySelector('input'))
  })

  it('ignores Enter while an IME composition is in progress', () => {
    editor = createEditor('<p>漢字</p>')
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })

    const rt = editor.view.dom.querySelector('ruby > rt') as HTMLElement
    rt.click()

    const input = rt.querySelector('input') as HTMLInputElement
    input.value = 'かんじ（新）'
    input.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', isComposing: true }),
    )

    expect(editor.getHTML()).not.toContain('かんじ（新）')
    expect(rt.querySelector('input')).toBe(input)
  })

  it('renders a custom annotation editor instead of the default input', () => {
    editor = createEditor('<p>漢字</p>', {
      renderAnnotationEditor: () => {
        const button = document.createElement('button')
        button.dataset.testid = 'custom-editor'
        return button
      },
    })
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })

    const rt = editor.view.dom.querySelector('ruby > rt') as HTMLElement
    rt.click()

    expect(rt.querySelector('[data-testid="custom-editor"]')).not.toBeNull()
    expect(rt.querySelector('input')).toBeNull()
  })

  it('focuses the autofocus control inside a custom editor', () => {
    editor = createEditor('<p>漢字</p>', {
      renderAnnotationEditor: () => {
        const wrapper = document.createElement('span')
        const input = document.createElement('input')
        input.autofocus = true
        wrapper.appendChild(input)
        return wrapper
      },
    })
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })

    const rt = editor.view.dom.querySelector('ruby > rt') as HTMLElement
    rt.click()

    expect(document.activeElement).toBe(rt.querySelector('input'))
  })

  it('passes the annotation and editor instance to the custom editor', () => {
    let receivedAnnotation: string | undefined
    let receivedEditor: Editor | undefined

    editor = createEditor('<p>漢字</p>', {
      renderAnnotationEditor: ({ annotation, editor: editorInstance }) => {
        receivedAnnotation = annotation
        receivedEditor = editorInstance
        return document.createElement('span')
      },
    })
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })

    const rt = editor.view.dom.querySelector('ruby > rt') as HTMLElement
    rt.click()

    expect(receivedAnnotation).toBe('かんじ')
    expect(receivedEditor).toBe(editor)
  })

  it('updates the annotation when a custom editor submits a value', () => {
    let submit: ((value: string) => void) | undefined

    editor = createEditor('<p>漢字</p>', {
      renderAnnotationEditor: props => {
        submit = props.submit
        return document.createElement('span')
      },
    })
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })

    const rt = editor.view.dom.querySelector('ruby > rt') as HTMLElement
    rt.click()
    submit?.('かんじ（新）')

    expect(editor.getHTML()).toContain('かんじ（新）')
    expect(editor.view.dom.querySelector('ruby > rt')?.textContent).toBe('かんじ（新）')
    expect(editor.state.selection.from).toBe(3)
  })

  it('restores the annotation when a custom editor dismisses', () => {
    let dismiss: (() => void) | undefined

    editor = createEditor('<p>漢字</p>', {
      renderAnnotationEditor: props => {
        dismiss = props.dismiss
        const span = document.createElement('span')
        span.dataset.testid = 'custom-editor'
        return span
      },
    })
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })

    const rt = editor.view.dom.querySelector('ruby > rt') as HTMLElement
    rt.click()
    dismiss?.()

    expect(editor.getHTML()).toContain('かんじ')
    expect(rt.textContent).toBe('かんじ')
    expect(rt.querySelector('[data-testid="custom-editor"]')).toBeNull()
    expect(editor.state.selection.from).toBe(3)
  })

  it('ignores submit and dismiss after the editor is closed', () => {
    let submit: ((value: string) => void) | undefined
    let dismiss: (() => void) | undefined
    let updates = 0

    editor = createEditor('<p>漢字</p>', {
      renderAnnotationEditor: props => {
        submit = props.submit
        dismiss = props.dismiss
        return document.createElement('span')
      },
    })
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })
    editor.on('update', () => {
      updates += 1
    })

    const rt = editor.view.dom.querySelector('ruby > rt') as HTMLElement
    rt.click()
    submit?.('かんじ（新）')
    submit?.('かんじ（無視）')
    dismiss?.()

    expect(updates).toBe(1)
    expect(editor.getHTML()).toContain('かんじ（新）')
    expect(editor.getHTML()).not.toContain('かんじ（無視）')
  })

  it('dismisses instead of submitting when the editor became non-editable', () => {
    let submit: ((value: string) => void) | undefined

    editor = createEditor('<p>漢字</p>', {
      renderAnnotationEditor: props => {
        submit = props.submit
        return document.createElement('span')
      },
    })
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })

    const rt = editor.view.dom.querySelector('ruby > rt') as HTMLElement
    rt.click()
    editor.setEditable(false)

    expect(submit).toBeDefined()
    submit?.('かんじ（新）')

    expect(editor.getHTML()).toContain('かんじ')
    expect(editor.getHTML()).not.toContain('かんじ（新）')
  })

  it('ignores submit when the document changed while editing', () => {
    let submit: ((value: string) => void) | undefined

    editor = createEditor('<p>漢字</p>', {
      renderAnnotationEditor: props => {
        submit = props.submit
        return document.createElement('span')
      },
    })
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })

    const rt = editor.view.dom.querySelector('ruby > rt') as HTMLElement
    rt.click()

    expect(submit).toBeDefined()

    // Shift the ruby range so the captured submit becomes stale.
    editor.commands.insertContentAt(1, 'あ')
    submit?.('かんじ（新）')

    expect(editor.getHTML()).toContain('かんじ')
    expect(editor.getHTML()).not.toContain('かんじ（新）')
  })

  it('does not invoke the custom editor when click editing is disabled', () => {
    let invoked = false

    editor = createEditor('<p>漢字</p>', {
      allowClickToEdit: false,
      renderAnnotationEditor: () => {
        invoked = true
        return document.createElement('span')
      },
    })
    editor.commands.selectAll()
    editor.commands.setRubyText({ rt: 'かんじ' })

    const rt = editor.view.dom.querySelector('ruby > rt') as HTMLElement
    rt.click()

    expect(invoked).toBe(false)
  })

  it('parses ruby HTML with rb and rt elements', () => {
    editor = createEditor('<p><ruby><rb>漢字</rb><rt>かんじ</rt></ruby></p>')

    expect(editor.getJSON()).toMatchObject({
      content: [
        {
          content: [
            {
              text: '漢字',
              marks: [{ type: 'rubyText', attrs: { rt: 'かんじ' } }],
            },
          ],
        },
      ],
    })
  })

  it('parses native ruby HTML without an rb element', () => {
    editor = createEditor('<p><ruby>東京<rt>とうきょう</rt></ruby>は日本の首都です。</p>')

    expect(editor.getJSON()).toMatchObject({
      content: [
        {
          content: [
            {
              text: '東京',
              marks: [{ type: 'rubyText', attrs: { rt: 'とうきょう' } }],
            },
            {
              text: 'は日本の首都です。',
            },
          ],
        },
      ],
    })
  })

  it('does not parse ruby HTML without an annotation as a mark', () => {
    editor = createEditor('<p><ruby>漢字</ruby></p>')

    expect(editor.getJSON()).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '漢字' }],
        },
      ],
    })
  })
})
