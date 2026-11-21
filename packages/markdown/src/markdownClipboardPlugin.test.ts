import { Editor } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import { CodeBlock } from '@tiptap/extension-code-block'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Italic from '@tiptap/extension-italic'
import Link from '@tiptap/extension-link'
import { BulletList, ListItem } from '@tiptap/extension-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { Markdown, type MarkdownExtensionOptions } from './Extension.js'

type CreateEditorOptions = Pick<
  MarkdownExtensionOptions,
  'transformPastedText' | 'shouldTransformPastedText'
> & {
  withHeading?: boolean
  withLink?: boolean
  withBlocks?: boolean
}

const createEditor = ({
  withHeading = true,
  withLink = false,
  withBlocks = false,
  ...markdownOptions
}: CreateEditorOptions = {}) =>
  new Editor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      ...(withHeading ? [Heading] : []),
      ...(withLink ? [Link] : []),
      ...(withBlocks ? [BulletList, ListItem, CodeBlock] : []),
      Markdown.configure(markdownOptions),
    ],
    content: '<p></p>',
  })

const paste = (editor: Editor, text: string, html?: string) => {
  const clipboardData = new DataTransfer()

  clipboardData.setData('text/plain', text)

  if (html) {
    clipboardData.setData('text/html', html)
  }

  editor.view.dom.dispatchEvent(
    new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }),
  )
}

const pasteText = (editor: Editor, text: string) => paste(editor, text)

const pasteHtml = (editor: Editor, text: string, html: string) => paste(editor, text, html)

const pasteTextWithShift = (editor: Editor, text: string) => {
  const init = { key: 'Shift', keyCode: 16, shiftKey: true, bubbles: true }

  editor.view.dom.dispatchEvent(new KeyboardEvent('keydown', init))
  pasteText(editor, text)
  editor.view.dom.dispatchEvent(new KeyboardEvent('keyup', init))
}

const dropText = (editor: Editor, text: string) => {
  const dataTransfer = new DataTransfer()

  dataTransfer.setData('text/plain', text)
  editor.view.posAtCoords = () => ({ pos: editor.state.doc.content.size - 1, inside: -1 })

  const event = new DragEvent('drop', { bubbles: true, cancelable: true })

  Object.defineProperty(event, 'dataTransfer', { value: dataTransfer })
  editor.view.dom.dispatchEvent(event)
}

const blockTypes = (editor: Editor) => editor.getJSON().content?.map(node => node.type)

const inlineMarks = (editor: Editor, blockIndex = 0) =>
  editor
    .getJSON()
    .content?.[blockIndex].content?.map(node => [
      node.text,
      (node.marks ?? []).map(mark => mark.type).sort(),
    ])

describe('markdown paste event', () => {
  let editor: Editor

  afterEach(() => editor?.destroy())

  it('does not intercept an HTML paste after a text paste handled by another plugin', () => {
    editor = createEditor({ transformPastedText: true, withLink: true })
    editor.commands.setContent('<p>word</p>')
    editor.commands.setTextSelection({ from: 1, to: 5 })

    pasteText(editor, 'https://example.com')
    editor.commands.setTextSelection(editor.state.doc.content.size - 1)
    pasteHtml(editor, '**bold**', '<p>**bold**</p>')

    const marks = editor.getJSON().content?.[0].content?.map(node => node.marks?.[0]?.type)

    expect(marks).toContain('bold')
  })

  it('does not reuse a stale slice for view.pasteText after another plugin handled the paste', () => {
    editor = createEditor({ transformPastedText: true, withLink: true })
    editor.commands.setContent('<p>word here</p>')
    editor.commands.setTextSelection({ from: 1, to: 5 })

    pasteText(editor, 'https://example.com')
    editor.commands.setTextSelection(editor.state.doc.content.size - 1)
    editor.view.pasteText('FRESH PLAIN')

    expect(editor.getText()).toBe('word hereFRESH PLAIN')
  })

  it('does not reuse a stale slice for view.pasteHTML after another plugin handled the paste', () => {
    editor = createEditor({ transformPastedText: true, withLink: true })
    editor.commands.setContent('<p>word here</p>')
    editor.commands.setTextSelection({ from: 1, to: 5 })

    pasteText(editor, 'https://example.com')
    editor.commands.setTextSelection(editor.state.doc.content.size - 1)
    editor.view.pasteHTML('<strong>FRESHHTML</strong>')

    expect(editor.getText()).toBe('word hereFRESHHTML')
    expect(inlineMarks(editor)?.at(-1)).toEqual(['FRESHHTML', ['bold']])
  })

  it('does not delete the selection on an empty paste after a stale flag', () => {
    editor = createEditor({ transformPastedText: true, withLink: true })
    editor.commands.setContent('<p>word other</p>')
    editor.commands.setTextSelection({ from: 1, to: 5 })

    pasteText(editor, 'https://example.com')
    editor.commands.setContent('<p>word other</p>')
    editor.commands.setTextSelection({ from: 6, to: 11 })

    editor.view.dom.dispatchEvent(
      new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
        bubbles: true,
        cancelable: true,
      }),
    )

    expect(editor.getText()).toBe('word other')
  })

  it('emits the editor paste event for a converted markdown paste', () => {
    editor = createEditor({ transformPastedText: true })

    const calls: { slice?: unknown }[] = []

    editor.on('paste', props => calls.push(props))
    pasteText(editor, '**bold**')

    expect(calls).toHaveLength(1)
    expect(calls[0].slice).toBeDefined()
  })

  it('converts unescaped markdown', () => {
    editor = createEditor({ transformPastedText: true })

    pasteText(editor, '**bold**')

    expect(editor.getText()).toBe('bold')
    expect(inlineMarks(editor)).toEqual([['bold', ['bold']]])
  })

  it('keeps escaped markdown literal', () => {
    editor = createEditor({ transformPastedText: true })

    pasteText(editor, '\\*\\*literal\\*\\*')

    expect(inlineMarks(editor)).toEqual([['**literal**', []]])
  })

  it('converts a closed multi-block paste', () => {
    editor = createEditor({ transformPastedText: true })

    pasteText(editor, '# title\n\n## sub')

    expect(editor.getJSON().content).toMatchObject([
      { type: 'heading', attrs: { level: 1 } },
      { type: 'heading', attrs: { level: 2 } },
    ])
  })

  it('merges a single pasted paragraph into the current text', () => {
    editor = createEditor({ transformPastedText: true })
    editor.commands.setContent('<p>ab</p>')
    editor.commands.setTextSelection(2)

    pasteText(editor, 'x *y*')

    expect(blockTypes(editor)).toEqual(['paragraph'])
    expect(editor.getText()).toBe('ax yb')
  })

  it('keeps a Shift paste raw', () => {
    editor = createEditor({ transformPastedText: true })

    pasteTextWithShift(editor, '# title')

    expect(blockTypes(editor)).toEqual(['paragraph'])
    expect(editor.getText()).toBe('# title')
  })

  it.each([
    ['by default', undefined],
    ['when disabled', false],
  ])('does not convert %s', (_label, transformPastedText) => {
    editor = createEditor({ transformPastedText })

    pasteText(editor, '# title')

    expect(blockTypes(editor)).toEqual(['paragraph'])
    expect(editor.getText()).toBe('# title')
  })

  it('ignores an empty paste', () => {
    editor = createEditor({ transformPastedText: true })
    editor.commands.setContent('<p>word</p>')

    pasteText(editor, '')

    expect(editor.getText()).toBe('word')
  })

  it('pastes as plain text when the schema lacks a parsed node', () => {
    editor = createEditor({ transformPastedText: true, withHeading: false })

    pasteText(editor, '# title')

    expect(blockTypes(editor)).toEqual(['paragraph'])
    expect(editor.getText()).toBe('# title')
  })

  describe('paste only conversion', () => {
    it('keeps an external drop of markdown as a plain paragraph', () => {
      editor = createEditor({ transformPastedText: true })

      dropText(editor, '# Title')

      expect(blockTypes(editor)).toEqual(['paragraph'])
      expect(editor.getText()).toBe('# Title')
    })

    it('does not leak a markdown paste into a later drop', () => {
      editor = createEditor({ transformPastedText: true })

      pasteText(editor, '# A')
      dropText(editor, '# B')

      expect(editor.getJSON().content).toMatchObject([
        { type: 'heading', content: [{ text: 'A# B' }] },
      ])
    })

    it('keeps a drop plain after a paste handled by another plugin', () => {
      editor = createEditor({ transformPastedText: true, withLink: true })
      editor.commands.setContent('<p>word</p>')
      editor.commands.setTextSelection({ from: 1, to: 5 })

      pasteText(editor, 'https://example.com')
      dropText(editor, '# Title')

      expect(blockTypes(editor)).toEqual(['paragraph'])
    })
  })

  describe('markdown signal', () => {
    it('keeps entity text exactly as typed', () => {
      editor = createEditor({ transformPastedText: true })

      pasteText(editor, 'AT&amp;T')

      expect(editor.getText()).toBe('AT&amp;T')
    })

    it('leaves plain words to the normal paste', () => {
      editor = createEditor({ transformPastedText: true })

      const calls: unknown[] = []

      editor.on('paste', props => calls.push(props))
      pasteText(editor, 'hello world')

      expect(editor.getText()).toBe('hello world')
      expect(calls).toHaveLength(1)
    })

    it('pastes line breaks like the option off', () => {
      editor = createEditor({ transformPastedText: true })

      const reference = createEditor({ transformPastedText: false })

      pasteText(editor, 'line1\nline2')
      pasteText(reference, 'line1\nline2')

      expect(editor.getJSON()).toEqual(reference.getJSON())
      reference.destroy()
    })

    it('converts inline markdown to marks', () => {
      editor = createEditor({ transformPastedText: true, withLink: true })

      pasteText(editor, '[l](https://x.example)')

      expect(inlineMarks(editor)).toEqual([['l', ['link']]])
    })

    it('converts blocks to nodes', () => {
      editor = createEditor({ transformPastedText: true })

      pasteText(editor, '# H')

      expect(blockTypes(editor)).toEqual(['heading'])
    })

    it('keeps escaped markdown as literal text', () => {
      editor = createEditor({ transformPastedText: true })

      pasteText(editor, '\\*\\*literal\\*\\*')

      expect(editor.getText()).toBe('**literal**')
      expect(editor.getJSON().content?.[0].content?.[0].marks).toBeUndefined()
    })

    it('lets a predicate veto the default decision', () => {
      editor = createEditor({
        transformPastedText: true,
        shouldTransformPastedText: (text, { defaultShouldTransform }) =>
          !text.includes('@') && defaultShouldTransform,
      })

      pasteText(editor, '# a@b')
      pasteText(editor, '# ab')

      expect(editor.getJSON().content).toMatchObject([
        { type: 'paragraph', content: [{ text: '# a@b' }] },
        { type: 'heading', content: [{ text: 'ab' }] },
      ])
    })

    it('lets a predicate force a conversion', () => {
      editor = createEditor({
        transformPastedText: true,
        shouldTransformPastedText: text => text === 'plain words',
      })

      pasteText(editor, 'plain words')

      expect(editor.getText()).toBe('plain words')
      expect(blockTypes(editor)).toEqual(['paragraph'])
    })

    it('gives the predicate the tokens, the editor and the default decision', () => {
      const shouldTransformPastedText = vi.fn(() => true)

      editor = createEditor({ transformPastedText: true, shouldTransformPastedText })

      pasteText(editor, '**ab**')

      expect(shouldTransformPastedText).toHaveBeenCalledWith('**ab**', {
        tokens: expect.any(Array),
        editor,
        defaultShouldTransform: true,
      })
    })

    it('passes false as the default decision for plain words', () => {
      const shouldTransformPastedText = vi.fn(() => false)

      editor = createEditor({ transformPastedText: true, shouldTransformPastedText })

      pasteText(editor, 'plain words')

      expect(shouldTransformPastedText).toHaveBeenCalledWith(
        'plain words',
        expect.objectContaining({ defaultShouldTransform: false }),
      )
    })

    it('does not call the predicate when the option is off', () => {
      const shouldTransformPastedText = vi.fn(() => true)

      editor = createEditor({ transformPastedText: false, shouldTransformPastedText })

      pasteText(editor, '**ab**')

      expect(shouldTransformPastedText).not.toHaveBeenCalled()
    })

    it('does not call the predicate on a Shift paste', () => {
      const shouldTransformPastedText = vi.fn(() => true)

      editor = createEditor({ transformPastedText: true, shouldTransformPastedText })

      pasteTextWithShift(editor, '**ab**')

      expect(shouldTransformPastedText).not.toHaveBeenCalled()
    })

    it('does not call the predicate when the clipboard has HTML', () => {
      const shouldTransformPastedText = vi.fn(() => true)

      editor = createEditor({ transformPastedText: true, shouldTransformPastedText })

      pasteHtml(editor, '**ab**', '<p>**ab**</p>')

      expect(shouldTransformPastedText).not.toHaveBeenCalled()
    })

    it('uses markdown tokenizers registered by extensions', () => {
      const shouldTransformPastedText = vi.fn(() => false)

      editor = createEditor({ transformPastedText: true, shouldTransformPastedText })
      editor.markdown?.instance.use({
        extensions: [
          {
            name: 'highlight',
            level: 'inline',
            start: (src: string) => src.indexOf('=='),
            tokenizer(src: string) {
              const match = /^==([^=]+)==/.exec(src)

              return match ? { type: 'highlight', raw: match[0], text: match[1] } : undefined
            },
          },
        ],
      })

      pasteText(editor, 'a ==b==')

      const { tokens, defaultShouldTransform } = (
        shouldTransformPastedText.mock.calls as unknown as [
          string,
          { tokens: { tokens?: { type: string }[] }[]; defaultShouldTransform: boolean },
        ][]
      )[0][1]

      expect(tokens[0].tokens?.map(token => token.type)).toContain('highlight')
      expect(defaultShouldTransform).toBe(true)
    })
  })

  describe('blocks pasted into an existing document', () => {
    const setUp = () => {
      editor = createEditor({ transformPastedText: true, withBlocks: true })
      editor.commands.setContent('<p>before</p><p>after</p>')
      editor.commands.setTextSelection(7)
    }

    it('pastes a bullet list between the paragraphs', () => {
      setUp()

      pasteText(editor, '- a\n- b')

      const content = editor.getJSON().content

      expect(content?.map(node => node.type)).toEqual(['paragraph', 'bulletList', 'paragraph'])
      expect(content?.[1].content).toHaveLength(2)
      expect(content?.[0].content?.[0].text).toBe('before')
      expect(content?.[2].content?.[0].text).toBe('after')
    })

    it('pastes a fenced code block between the paragraphs', () => {
      setUp()

      pasteText(editor, '```js\ncode\n```')

      const content = editor.getJSON().content

      expect(content?.map(node => node.type)).toEqual(['paragraph', 'codeBlock', 'paragraph'])
      expect(content?.[1].attrs?.language).toBe('js')
      expect(content?.[1].content?.[0].text).toBe('code')
      expect(content?.[0].content?.[0].text).toBe('before')
      expect(content?.[2].content?.[0].text).toBe('after')
    })
  })

  describe('inherited marks at the insertion point', () => {
    it('applies the context marks to pasted inline content', () => {
      editor = createEditor({ transformPastedText: true })
      editor.commands.setContent('<p><strong>bold</strong></p>')
      editor.commands.setTextSelection(3)

      pasteText(editor, 'hello *world*')

      expect(inlineMarks(editor)).toEqual([
        ['bohello ', ['bold']],
        ['world', ['bold', 'italic']],
        ['ld', ['bold']],
      ])
    })

    it('keeps italic context next to parsed bold', () => {
      editor = createEditor({ transformPastedText: true })
      editor.commands.setContent('<p><em>text</em></p>')
      editor.commands.setTextSelection(3)

      pasteText(editor, 'a **b** c')

      expect(inlineMarks(editor)).toEqual([
        ['tea ', ['italic']],
        ['b', ['bold', 'italic']],
        [' cxt', ['italic']],
      ])
    })

    it('keeps the pasted link href over the context link href', () => {
      editor = createEditor({ transformPastedText: true, withLink: true })
      editor.commands.setContent('<p><a href="https://old.example">link</a></p>')
      editor.commands.setTextSelection(3)

      pasteText(editor, '[new](https://new.example)')

      const hrefs = editor
        .getJSON()
        .content?.[0].content?.map(node => [node.text, node.marks?.[0].attrs?.href])

      expect(hrefs).toEqual([
        ['li', 'https://old.example'],
        ['new', 'https://new.example'],
        ['nk', 'https://old.example'],
      ])
    })

    it('adds no marks when the context has none', () => {
      editor = createEditor({ transformPastedText: true })

      pasteText(editor, 'hello *world*')

      expect(inlineMarks(editor)).toEqual([
        ['hello ', []],
        ['world', ['italic']],
      ])
    })

    it('does not apply the context marks to multiple blocks', () => {
      editor = createEditor({ transformPastedText: true })
      editor.commands.setContent('<p><strong>bold</strong></p>')
      editor.commands.setTextSelection(3)

      pasteText(editor, '# title\n\ntext')

      const heading = editor.getJSON().content?.find(node => node.type === 'heading')

      expect(heading?.content?.[0].marks).toBeUndefined()
    })
  })

  describe('together with the Link extension', () => {
    it('keeps the markdown link target when pasting over a selection', () => {
      editor = createEditor({ transformPastedText: true, withLink: true })
      editor.commands.setContent('<p>word</p>')
      editor.commands.setTextSelection({ from: 1, to: 5 })

      pasteText(editor, '[https://label.example](https://target.example)')

      const nodes = editor.getJSON().content?.[0].content

      expect(editor.getText()).toBe('https://label.example')
      expect(nodes?.[0].marks?.[0].attrs?.href).toBe('https://target.example')
    })
  })
})
