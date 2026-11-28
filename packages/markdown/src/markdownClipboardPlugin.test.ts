import { Editor, type EditorOptions } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Code from '@tiptap/extension-code'
import { CodeBlock } from '@tiptap/extension-code-block'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Italic from '@tiptap/extension-italic'
import Link from '@tiptap/extension-link'
import { BulletList, ListItem } from '@tiptap/extension-list'
import Paragraph from '@tiptap/extension-paragraph'
import { TableKit } from '@tiptap/extension-table'
import Text from '@tiptap/extension-text'
import Youtube from '@tiptap/extension-youtube'
import { Fragment, Slice } from '@tiptap/pm/model'
import { TextSelection } from '@tiptap/pm/state'
import { CellSelection } from '@tiptap/pm/tables'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { Markdown, type MarkdownExtensionOptions } from './Extension.js'

type CreateEditorOptions = Pick<
  MarkdownExtensionOptions,
  'transformPastedText' | 'shouldTransformPastedText'
> & {
  withHeading?: boolean
  withLink?: boolean
  withBlocks?: boolean
  editorProps?: EditorOptions['editorProps']
}

const createEditor = ({
  withHeading = true,
  withLink = false,
  withBlocks = false,
  editorProps = {},
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
    editorProps,
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

    it.each(['**b**', '**b**\n', 'line1\nline2 **b**'])(
      'pastes %j as plain text inside inline code',
      text => {
        const createCodeEditor = (transformPastedText: boolean) => {
          const codeEditor = new Editor({
            extensions: [
              Document,
              Paragraph,
              Text,
              Bold,
              Code,
              Markdown.configure({ transformPastedText }),
            ],
            content: '<p><code>xy</code></p>',
          })

          codeEditor.commands.setTextSelection(2)

          return codeEditor
        }
        const reference = createCodeEditor(false)

        editor = createCodeEditor(true)
        pasteText(reference, text)
        pasteText(editor, text)

        expect(editor.getJSON()).toEqual(reference.getJSON())
        reference.destroy()
      },
    )
  })

  describe('app transformPasted', () => {
    const stripBold = (slice: Slice): Slice => {
      const strip = (fragment: Fragment): Fragment => {
        const children: Parameters<typeof Fragment.fromArray>[0] = []

        fragment.forEach(node => {
          const marks = node.marks.filter(mark => mark.type.name !== 'bold')

          children.push(node.isText ? node.mark(marks) : node.copy(strip(node.content)))
        })

        return Fragment.fromArray(children)
      }

      return new Slice(strip(slice.content), slice.openStart, slice.openEnd)
    }

    const hasBold = (slice: Slice) => {
      let found = false

      slice.content.descendants(node => {
        if (node.marks.some(mark => mark.type.name === 'bold')) {
          found = true
        }
      })

      return found
    }

    const insertBetweenParagraphs = (editor: Editor) => {
      editor.commands.setContent('<p>before</p><p>after</p>')
      editor.commands.setTextSelection(7)
    }

    it('applies the transform to the inserted markdown and the paste event', () => {
      editor = createEditor({
        transformPastedText: true,
        editorProps: { transformPasted: stripBold },
      })

      const slices: Slice[] = []

      editor.on('paste', ({ slice }) => slices.push(slice))
      pasteText(editor, '**bold**')

      expect(editor.getText()).toBe('bold')
      expect(inlineMarks(editor)).toEqual([['bold', []]])
      expect(slices).toHaveLength(1)
      expect(slices[0].content.textBetween(0, slices[0].content.size)).toBe('bold')
      expect(hasBold(slices[0])).toBe(false)
    })

    it('runs the transform once per paste', () => {
      const transformPasted = vi.fn((slice: Slice) => {
        const upper = (fragment: Fragment): Fragment => {
          const children: Parameters<typeof Fragment.fromArray>[0] = []

          fragment.forEach(node => {
            children.push(
              node.isText
                ? node.type.schema.text(node.text!.toUpperCase(), node.marks)
                : node.copy(upper(node.content)),
            )
          })

          return Fragment.fromArray(children)
        }

        return new Slice(upper(slice.content), slice.openStart, slice.openEnd)
      })

      editor = createEditor({ transformPastedText: true, editorProps: { transformPasted } })

      pasteText(editor, '**bold** text')

      expect(editor.getText()).toBe('BOLD TEXT')
      expect(transformPasted).toHaveBeenCalledTimes(1)
    })

    it('keeps a pasted list as a separate block', () => {
      editor = createEditor({
        transformPastedText: true,
        withBlocks: true,
        editorProps: { transformPasted: stripBold },
      })
      insertBetweenParagraphs(editor)

      pasteText(editor, '- a\n- b')

      expect(blockTypes(editor)).toEqual(['paragraph', 'bulletList', 'paragraph'])
    })

    it('keeps a pasted code block as a separate block', () => {
      editor = createEditor({
        transformPastedText: true,
        withBlocks: true,
        editorProps: { transformPasted: stripBold },
      })
      insertBetweenParagraphs(editor)

      pasteText(editor, '```js\ncode\n```')

      expect(blockTypes(editor)).toEqual(['paragraph', 'codeBlock', 'paragraph'])
    })

    it('keeps a heading and a paragraph as separate blocks', () => {
      editor = createEditor({
        transformPastedText: true,
        editorProps: { transformPasted: stripBold },
      })

      pasteText(editor, '# t\n\n**p**')

      expect(blockTypes(editor)).toEqual(['heading', 'paragraph'])
      expect(inlineMarks(editor, 1)).toEqual([['p', []]])
    })

    it('still merges a lone paragraph into marked context', () => {
      editor = createEditor({
        transformPastedText: true,
        editorProps: { transformPasted: slice => slice },
      })
      editor.commands.setContent('<p><em>text</em></p>')
      editor.commands.setTextSelection(3)

      pasteText(editor, 'x *y* z')

      expect(blockTypes(editor)).toEqual(['paragraph'])
      expect(inlineMarks(editor)).toEqual([['tex y zxt', ['italic']]])
    })

    it('does not throw when a transform breaks the structure of a closed paste', () => {
      const emptyFirstItem = (slice: Slice) => {
        const list = slice.content.firstChild

        if (!list || list.type.name !== 'bulletList') {
          return slice
        }

        const items = list.children.map((item, index) =>
          index === 0 ? item.copy(Fragment.empty) : item,
        )

        return new Slice(Fragment.from(list.copy(Fragment.fromArray(items))), 2, 2)
      }

      editor = createEditor({
        transformPastedText: true,
        withBlocks: true,
        editorProps: { transformPasted: emptyFirstItem },
      })
      insertBetweenParagraphs(editor)

      expect(() => pasteText(editor, '- a\n- b')).not.toThrow()
      expect(() => editor.state.doc.check()).not.toThrow()
    })
  })

  describe('slice shape', () => {
    const blockTexts = (editor: Editor) =>
      editor.getJSON().content?.map(node => node.content?.map(child => child.text).join('') ?? '')

    it('hands a closed slice to an app paste handler', () => {
      const received: Slice[] = []

      editor = createEditor({
        transformPastedText: true,
        withBlocks: true,
        editorProps: {
          handlePaste: (view, _event, slice) => {
            received.push(slice)
            view.dispatch(view.state.tr.replaceSelection(slice))

            return true
          },
        },
      })
      editor.commands.setContent('<p>before</p><p>after</p>')
      editor.commands.setTextSelection(7)

      pasteText(editor, '- a\n- b')

      expect(received).toHaveLength(1)
      expect([received[0].openStart, received[0].openEnd]).toEqual([0, 0])
      expect(blockTypes(editor)).toEqual(['paragraph', 'bulletList', 'paragraph'])
    })

    it.each([
      ['trailing', '**b**\n', 'b\n', ['xb', 'y']],
      ['leading', '\n**b**', '\nb', ['x', 'by']],
    ])('splits the text at a %s newline like the option off', (_label, markdown, plain, texts) => {
      editor = createEditor({ transformPastedText: true })
      const reference = createEditor({ transformPastedText: false })

      for (const target of [editor, reference]) {
        target.commands.setContent('<p>xy</p>')
        target.commands.setTextSelection(2)
      }

      pasteText(editor, markdown)
      pasteText(reference, plain)

      expect(blockTexts(editor)).toEqual(texts)
      expect(blockTexts(reference)).toEqual(texts)
      reference.destroy()
    })
  })

  describe('a markdown paste consumed by another handler', () => {
    const createConsumingEditor = (transformPastedText: boolean) => {
      let consumed = false

      return createEditor({
        transformPastedText,
        editorProps: {
          handlePaste: () => {
            if (consumed) {
              return false
            }

            consumed = true

            return true
          },
        },
      })
    }

    it.each([
      ['pasteHTML', (target: Editor) => target.view.pasteHTML('<p>a</p><p>b</p>')],
      ['pasteText', (target: Editor) => target.view.pasteText('a\n\nb')],
    ])('does not change the shape of a later %s', (_label, programmaticPaste) => {
      editor = createConsumingEditor(true)

      const reference = createConsumingEditor(false)

      for (const target of [editor, reference]) {
        pasteText(target, '# H\n\ntext')
        target.commands.setContent('<p>xy</p>')
        target.commands.setTextSelection(2)
        programmaticPaste(target)
      }

      expect(editor.getJSON()).toEqual(reference.getJSON())
      reference.destroy()
    })
  })

  describe('soft line breaks', () => {
    it('splits a paragraph into one paragraph per line, merged into the context', () => {
      editor = createEditor({ transformPastedText: true })
      editor.commands.setContent('<p>xy</p>')
      editor.commands.setTextSelection(2)

      pasteText(editor, 'line1\nline2 **b**')

      expect(editor.getJSON().content).toMatchObject([
        { type: 'paragraph', content: [{ text: 'xline1' }] },
        {
          type: 'paragraph',
          content: [{ text: 'line2 ' }, { text: 'b', marks: [{ type: 'bold' }] }, { text: 'y' }],
        },
      ])
    })

    it('keeps the marks on every line of a marked span', () => {
      editor = createEditor({ transformPastedText: true })

      pasteText(editor, '**a\nb**')

      expect(blockTypes(editor)).toEqual(['paragraph', 'paragraph'])
      expect(inlineMarks(editor, 0)).toEqual([['a', ['bold']]])
      expect(inlineMarks(editor, 1)).toEqual([['b', ['bold']]])
    })

    it('splits the paragraphs of a list item', () => {
      editor = createEditor({ transformPastedText: true, withBlocks: true })

      pasteText(editor, '- a\n  b\n- c\n  d')

      const items = editor.getJSON().content?.[0].content

      expect(items?.map(item => item.content?.map(child => child.content?.[0].text))).toEqual([
        ['a', 'b'],
        ['c', 'd'],
      ])
    })

    it('keeps the lines of a code block together', () => {
      editor = createEditor({ transformPastedText: true, withBlocks: true })

      pasteText(editor, '```\na\nb\n```')

      expect(blockTypes(editor)).toEqual(['codeBlock'])
      expect(editor.getJSON().content?.[0].content).toEqual([{ type: 'text', text: 'a\nb' }])
    })

    it('puts a heading and the following line in separate blocks', () => {
      editor = createEditor({ transformPastedText: true })

      pasteText(editor, '# t\nbody')

      expect(blockTypes(editor)).toEqual(['heading', 'paragraph'])
    })
  })

  describe('blank lines', () => {
    it('does not add empty paragraphs for extra blank lines', () => {
      editor = createEditor({ transformPastedText: true })

      pasteText(editor, '# t\n\n\n\nbody')

      expect(blockTypes(editor)).toEqual(['heading', 'paragraph'])
    })

    it('keeps the blank lines inside a code block', () => {
      editor = createEditor({ transformPastedText: true, withBlocks: true })

      pasteText(editor, '```\na\n\n\nb\n```')

      expect(editor.getJSON().content?.[0].content).toEqual([{ type: 'text', text: 'a\n\n\nb' }])
    })
  })

  describe('paragraphs only', () => {
    const pasteInto = (transformPastedText: boolean, html: string, caret: number, text: string) => {
      const target = createEditor({ transformPastedText })

      target.commands.setContent(html)
      target.commands.setTextSelection(caret)
      pasteText(target, text)

      return target
    }

    const paragraphTexts = (target: Editor) =>
      target.state.doc.children.map(node => [node.type.name, node.textContent.replaceAll('*', '')])

    it('merges the first and last paragraph into the surrounding text', () => {
      editor = pasteInto(true, '<p>plain text</p>', 6, 'a\n\n\n\nb **c**')

      expect(editor.getJSON().content).toMatchObject([
        { type: 'paragraph', content: [{ text: 'plaina' }] },
        {
          type: 'paragraph',
          content: [{ text: 'b ' }, { text: 'c', marks: [{ type: 'bold' }] }, { text: ' text' }],
        },
      ])
    })

    it.each(['a **x**\n\nb', '\n**a**\n\nb', '**a**\n\nb\n', '**a**\n\nb\n\nc'])(
      'keeps the paragraph structure of the option off for %j',
      text => {
        const reference = pasteInto(false, '<p>plain text</p>', 6, text)

        editor = pasteInto(true, '<p>plain text</p>', 6, text)

        expect(paragraphTexts(editor)).toEqual(paragraphTexts(reference))
        reference.destroy()
      },
    )

    it.each([
      ['<strong>bold</strong>', [[['box', ['bold']]], [['yld', ['bold']]]]],
      [
        '<em>italic</em>',
        [
          [
            ['it', ['italic']],
            ['x', ['bold', 'italic']],
          ],
          [
            ['y', ['bold', 'italic']],
            ['alic', ['italic']],
          ],
        ],
      ],
    ])('inherits the context marks on every line inside %s', (html, expected) => {
      editor = pasteInto(true, `<p>${html}</p>`, 3, '**x**\n\n**y**')

      expect([inlineMarks(editor, 0), inlineMarks(editor, 1)]).toEqual(expected)
    })

    it('keeps a heading among paragraphs as closed blocks', () => {
      editor = pasteInto(true, '<p>plain text</p>', 6, 'a\n\n# H\n\nb')

      expect(blockTypes(editor)).toEqual([
        'paragraph',
        'paragraph',
        'heading',
        'paragraph',
        'paragraph',
      ])
      expect(editor.getText({ blockSeparator: '|' })).toBe('plain|a|H|b| text')
    })
  })

  describe('bare URLs', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

    const createYoutubeEditor = (transformPastedText: boolean) =>
      new Editor({
        extensions: [
          Document,
          Paragraph,
          Text,
          Youtube,
          Markdown.configure({ transformPastedText }),
        ],
        content: '<p></p>',
      })

    it('lets the paste rules of other extensions turn a video URL into a node', () => {
      editor = createYoutubeEditor(true)

      pasteText(editor, url)

      expect(blockTypes(editor)).toContain('youtube')
    })

    it('pastes a video URL like the option off', () => {
      editor = createYoutubeEditor(true)

      const reference = createYoutubeEditor(false)

      pasteText(editor, url)
      pasteText(reference, url)

      expect(editor.getJSON()).toEqual(reference.getJSON())
      reference.destroy()
    })

    it('keeps a URL with a trailing underscore whole and linked', () => {
      editor = createEditor({ transformPastedText: true, withLink: true })

      pasteText(editor, 'https://a.com/x_')

      expect(inlineMarks(editor)).toEqual([['https://a.com/x_', ['link']]])
    })
  })

  describe('block leaf at the end of a paste', () => {
    const createRuleEditor = (content: string) => {
      return new Editor({
        extensions: [
          Document,
          Paragraph,
          Text,
          HorizontalRule,
          BulletList,
          ListItem,
          Markdown.configure({ transformPastedText: true }),
        ],
        content,
      })
    }

    const caretParentText = (editor: Editor) =>
      editor.state.selection instanceof TextSelection && editor.state.selection.empty
        ? editor.state.selection.$from.parent.textContent
        : null

    it('puts the caret in a new paragraph after the rule', () => {
      editor = createRuleEditor('<p></p>')

      pasteText(editor, '---')

      expect(blockTypes(editor)).toEqual(['horizontalRule', 'paragraph'])
      expect(editor.state.selection).toBeInstanceOf(TextSelection)
      expect(editor.state.selection.$from.parent.type.name).toBe('paragraph')
      expect(editor.state.selection.$from.pos).toBe(editor.state.doc.content.size - 1)
    })

    it('puts the caret in the paragraph that already follows the rule', () => {
      editor = createRuleEditor('<p>a</p><p>b</p>')
      editor.commands.setTextSelection(4)

      pasteText(editor, '---')

      expect(blockTypes(editor)).toEqual(['paragraph', 'horizontalRule', 'paragraph'])
      expect(caretParentText(editor)).toBe('b')
    })

    it('adds a paragraph between the rule and a list that follows', () => {
      editor = createRuleEditor('<p>a</p><ul><li><p>b</p></li></ul>')
      editor.commands.setTextSelection(2)

      pasteText(editor, '---')

      expect(blockTypes(editor)).toEqual(['paragraph', 'horizontalRule', 'paragraph', 'bulletList'])
      expect(caretParentText(editor)).toBe('')
    })

    it('adds the paragraph in the same transaction as the paste', () => {
      editor = createRuleEditor('<p>a</p>')
      editor.commands.setTextSelection(2)

      const transactions: unknown[] = []

      editor.on('transaction', ({ transaction }) => transactions.push(transaction))
      pasteText(editor, '---')

      expect(transactions).toHaveLength(1)
      expect(blockTypes(editor)).toEqual(['paragraph', 'horizontalRule', 'paragraph'])
    })
  })

  describe('clipboards that carry more than text', () => {
    const pasteWithFiles = (editor: Editor, text: string) => {
      const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true })

      Object.defineProperty(event, 'clipboardData', {
        value: {
          files: [new File(['dummy'], 'a.png', { type: 'image/png' })],
          types: ['text/plain', 'Files'],
          getData: (type: string) => (type === 'text/plain' ? text : ''),
        },
      })
      editor.view.dom.dispatchEvent(event)
    }

    it('keeps the text plain when the clipboard has files', () => {
      editor = createEditor({ transformPastedText: true })

      pasteWithFiles(editor, '# title')

      expect(blockTypes(editor)).toEqual(['paragraph'])
      expect(editor.getText()).toBe('# title')
    })

    it('keeps the text plain when the clipboard has VS Code editor data', () => {
      editor = createEditor({ transformPastedText: true })

      const clipboardData = new DataTransfer()

      clipboardData.setData('text/plain', '# title')
      clipboardData.setData('vscode-editor-data', '{"mode":"markdown"}')
      editor.view.dom.dispatchEvent(
        new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }),
      )

      expect(blockTypes(editor)).toEqual(['paragraph'])
      expect(editor.getText()).toBe('# title')
    })

    it('still converts text that comes with RTF', () => {
      editor = createEditor({ transformPastedText: true })

      const clipboardData = new DataTransfer()

      clipboardData.setData('text/plain', '# title')
      clipboardData.setData('text/rtf', '{\\rtf1 title}')
      editor.view.dom.dispatchEvent(
        new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }),
      )

      expect(blockTypes(editor)).toEqual(['heading'])
    })
  })

  describe('inside a table', () => {
    const emptyTable =
      '<table><tbody><tr><td><p></p></td><td><p></p></td></tr><tr><td><p></p></td><td><p></p></td></tr></tbody></table>'

    const createTableEditor = (transformPastedText: boolean, markdownFirst: boolean) => {
      const markdown = Markdown.configure({ transformPastedText })
      const base = [Document, Paragraph, Text, Bold, Italic, TableKit]

      return new Editor({
        extensions: markdownFirst ? [markdown, ...base] : [...base, markdown],
        content: emptyTable,
      })
    }

    const cellPositions = (target: Editor) => {
      const positions: number[] = []

      target.state.doc.descendants((node, pos) => {
        if (node.type.name === 'tableCell') {
          positions.push(pos)
        }
      })

      return positions
    }

    const selectFirstRowCells = (target: Editor) => {
      const [first, second] = cellPositions(target)

      target.view.dispatch(
        target.state.tr.setSelection(CellSelection.create(target.state.doc, first, second)),
      )
    }

    const tableCount = (target: Editor) =>
      JSON.stringify(target.getJSON()).split('"table"').length - 1

    describe.each([
      ['after the table extensions', false],
      ['before the table extensions', true],
    ])('with Markdown registered %s', (_label, markdownFirst) => {
      it('fills every selected cell with the pasted markdown', () => {
        editor = createTableEditor(true, markdownFirst)

        const reference = createTableEditor(false, markdownFirst)

        selectFirstRowCells(editor)
        selectFirstRowCells(reference)
        pasteText(editor, '**b**')
        pasteHtml(reference, '**b**', '<p><strong>b</strong></p>')

        const [firstRow] = editor.getJSON().content![0].content!
        const cellMarks = firstRow.content!.map(
          cell => cell.content?.[0].content?.[0].marks?.[0].type,
        )

        expect(cellMarks).toEqual(['bold', 'bold'])
        expect(editor.getJSON()).toEqual(reference.getJSON())
        reference.destroy()
      })

      it('keeps escaped markdown literal in every selected cell', () => {
        editor = createTableEditor(true, markdownFirst)
        selectFirstRowCells(editor)

        pasteText(editor, '\\*\\*x\\*\\*')

        const [firstRow] = editor.getJSON().content![0].content!
        const cells = firstRow.content!.map(cell => cell.content?.[0].content?.[0])

        expect(cells.map(node => node?.text)).toEqual(['**x**', '**x**'])
        expect(cells.map(node => node?.marks)).toEqual([undefined, undefined])
      })

      it('fills the cells like an HTML table paste instead of nesting a table', () => {
        editor = createTableEditor(true, markdownFirst)

        const reference = createTableEditor(false, markdownFirst)

        for (const target of [editor, reference]) {
          target.commands.setTextSelection(cellPositions(target)[0] + 2)
        }

        pasteText(editor, '| a | b |\n| - | - |\n| 1 | 2 |')
        pasteHtml(
          reference,
          '| a | b |\n| - | - |\n| 1 | 2 |',
          '<table><tbody><tr><th>a</th><th>b</th></tr><tr><td>1</td><td>2</td></tr></tbody></table>',
        )

        expect(tableCount(editor)).toBe(1)
        expect(editor.getJSON()).toEqual(reference.getJSON())
        reference.destroy()
      })
    })

    it('does not emit a paste event when the table handles the paste', () => {
      editor = createTableEditor(true, false)

      const onPaste = vi.fn()

      editor.on('paste', onPaste)
      selectFirstRowCells(editor)
      pasteText(editor, '**b**')

      expect(onPaste).not.toHaveBeenCalled()
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

    it('keeps the markdown link target when pasting inside an existing link', () => {
      editor = createEditor({ transformPastedText: true, withLink: true })
      editor.commands.setContent('<p><a href="https://old.example">word</a></p>')
      editor.commands.setTextSelection({ from: 2, to: 4 })

      pasteText(editor, '[https://label.example](https://target.example)')

      const pasted = editor
        .getJSON()
        .content?.[0].content?.find(node => node.text?.includes('label'))

      expect(pasted?.marks?.[0].attrs?.href).toBe('https://target.example')
    })

    it('relinks the selected text when pasting a bare URL over part of a link', () => {
      editor = createEditor({ transformPastedText: true, withLink: true })
      editor.commands.setContent('<p><a href="https://old.example">word</a></p>')
      editor.commands.setTextSelection({ from: 2, to: 4 })

      pasteText(editor, 'https://new.example')

      const nodes = editor.getJSON().content?.[0].content

      expect(editor.getText()).toBe('word')
      expect(nodes?.find(node => node.text === 'or')?.marks?.[0].attrs?.href).toBe(
        'https://new.example',
      )
    })
  })
})
