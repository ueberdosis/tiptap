import { extensions as coreExtensions } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import CodeBlock from '@tiptap/extension-code-block'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Link from '@tiptap/extension-link'
import Paragraph from '@tiptap/extension-paragraph'
import { generateTocIds, TableOfContents } from '@tiptap/extension-table-of-contents'
import Text from '@tiptap/extension-text'
import { generateUniqueIds, UniqueID } from '@tiptap/extension-unique-id'
import Youtube from '@tiptap/extension-youtube'
import { Mark, Node as PMNode } from '@tiptap/pm/model'
import { describe, expect, it } from 'vite-plus/test'

import {
  serializeAttrsToHTMLString,
  serializeChildrenToHTMLString,
} from '../../json/html-string/string.js'
import { domOutputSpecToHTMLString, renderToHTMLString } from './html-string.js'

describe('static render json to string (with prosemirror)', () => {
  it('generates an HTML string from JSON without an editor instance', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
              marks: [
                {
                  type: 'bold',
                  attrs: {},
                },
              ],
            },
          ],
        },
      ],
      attrs: {},
    }

    const html = renderToHTMLString({
      content: json,
      extensions: [Document, Paragraph, Text, Bold],
    })

    expect(html).toBe('<p><strong>Example Text</strong></p>')
  })

  it('supports custom mapping for nodes & marks', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
              marks: [
                {
                  type: 'bold',
                  attrs: {},
                },
              ],
            },
          ],
        },
      ],
      attrs: {},
    }

    const html = renderToHTMLString({
      content: json,
      extensions: [Document, Paragraph, Text, Bold],
      options: {
        nodeMapping: {
          doc: ({ children }) => {
            return `<doc>${serializeChildrenToHTMLString(children)}</doc>`
          },
        },
        markMapping: {
          bold: ({ children }) => {
            return `<b>${serializeChildrenToHTMLString(children)}</b>`
          },
        },
      },
    })

    expect(html).toBe('<doc><p><b>Example Text</b></p></doc>')
  })

  it('escapes text node content', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '<img src=x onerror=alert(document.cookie)> Tom & Jerry',
            },
          ],
        },
      ],
    }

    const html = renderToHTMLString({
      content: json,
      extensions: [Document, Paragraph, Text],
    })

    expect(html).toBe('<p>&lt;img src=x onerror=alert(document.cookie)&gt; Tom &amp; Jerry</p>')
  })

  it('escapes attribute values in the ProseMirror HTML string renderer', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Click here',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'https://tiptap.dev/?q="><img src=x onerror=alert(document.cookie)>',
                    target: '_blank',
                  },
                },
              ],
            },
          ],
        },
      ],
    }

    const html = renderToHTMLString({
      content: json,
      extensions: [Document, Paragraph, Text, Link],
    })

    expect(html).toContain(
      'href="https://tiptap.dev/?q=&quot;&gt;&lt;img src=x onerror=alert(document.cookie)&gt;"',
    )
  })

  it('escapes string DOM output specs as text content', () => {
    const html = domOutputSpecToHTMLString('<img src=x onerror=alert(document.cookie)>')()

    expect(html).toBe('&lt;img src=x onerror=alert(document.cookie)&gt;')
  })

  it('gives access to a prosemirror node or mark instance', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Example Text',
              marks: [
                {
                  type: 'bold',
                  attrs: {},
                },
              ],
            },
          ],
        },
      ],
      attrs: {},
    }

    const html = renderToHTMLString({
      content: json,
      extensions: [Document, Paragraph, Text, Bold],
      options: {
        nodeMapping: {
          doc: ({ children, node }) => {
            expect(node.type.name).toBe('doc')
            expect(node).toBeInstanceOf(PMNode)
            return `<doc>${serializeChildrenToHTMLString(children)}</doc>`
          },
        },
        markMapping: {
          bold: ({ children, mark }) => {
            expect(mark.type.name).toBe('bold')
            expect(mark).toBeInstanceOf(Mark)
            return `<b>${serializeChildrenToHTMLString(children)}</b>`
          },
        },
      },
    })

    expect(html).toBe('<doc><p><b>Example Text</b></p></doc>')
  })

  it('renders youtube extension followed by other nodes correctly', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'youtube',
          attrs: {
            src: 'https://www.youtube.com/watch?v=3lTUAWOgoHs',
          },
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'text after youtube',
            },
          ],
        },
      ],
    }

    const html = renderToHTMLString({
      content: json,
      extensions: [Document, Paragraph, Text, Youtube],
    })

    expect(html).to.include('data-youtube-video')
    expect(html).to.include('<p>text after youtube</p>')
  })

  const headingDoc = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'test' }],
      },
    ],
  }

  it.each(['ltr', 'rtl', 'auto'] as const)(
    'honors textDirection=%s via staticEditorOptions',
    direction => {
      const html = renderToHTMLString({
        content: headingDoc,
        extensions: [Document, Paragraph, Text, Heading],
        staticEditorOptions: { textDirection: direction },
      })

      expect(html).toContain(`dir="${direction}"`)
    },
  )

  it('does not add a dir attribute when staticEditorOptions is unset', () => {
    const html = renderToHTMLString({
      content: headingDoc,
      extensions: [Document, Paragraph, Text, Heading],
    })

    expect(html).not.toContain('dir=')
  })

  it('a user-supplied TextDirection wins over staticEditorOptions.textDirection (matches Editor precedence)', () => {
    // Editor.ts prepends its `textDirection`-driven TextDirection to
    // `this.options.extensions`, so a user-supplied TextDirection — coming
    // later in the array — wins via tiptap's last-defined precedence for
    // duplicate `addGlobalAttributes`. The static renderer mirrors that.
    const html = renderToHTMLString({
      content: headingDoc,
      extensions: [
        Document,
        Paragraph,
        Text,
        Heading,
        coreExtensions.TextDirection.configure({ direction: 'ltr' }),
      ],
      staticEditorOptions: { textDirection: 'rtl' },
    })

    expect(html).toContain('dir="ltr"')
    expect(html).not.toContain('dir="rtl"')
  })

  it('omits null and undefined attribute values instead of serializing them as strings', () => {
    expect(serializeAttrsToHTMLString({ class: null, id: undefined, dir: 'auto' })).toBe(
      ' dir="auto"',
    )
  })

  it('preserves false attribute values (matches ProseMirror DOMSerializer)', () => {
    expect(serializeAttrsToHTMLString({ contenteditable: false })).toBe(' contenteditable="false"')
  })

  it('does not emit class="null" for a CodeBlock without language', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'codeBlock',
          content: [{ type: 'text', text: 'hello' }],
        },
      ],
    }

    const html = renderToHTMLString({
      content: json,
      extensions: [Document, Paragraph, Text, CodeBlock],
    })

    expect(html).toBe('<pre><code>hello</code></pre>')
  })

  it('does not emit id="null" / data-toc-id="null" for TableOfContents nodes without IDs', () => {
    const html = renderToHTMLString({
      content: headingDoc,
      extensions: [Document, Paragraph, Text, Heading, TableOfContents],
    })

    expect(html).not.toContain('id="null"')
    expect(html).not.toContain('data-toc-id="null"')
  })

  it('renders UniqueID data-id attributes when JSON is pre-processed with generateUniqueIds', () => {
    const extensionsWithUid = [
      Document,
      Paragraph,
      Text,
      Heading,
      UniqueID.configure({ types: ['heading'] }),
    ]
    const docWithIds = generateUniqueIds(headingDoc, extensionsWithUid)

    const html = renderToHTMLString({ content: docWithIds, extensions: extensionsWithUid })

    expect(html).toMatch(/data-id="[^"]+"/)
  })

  it('renders TableOfContents anchor IDs when JSON is pre-processed with generateTocIds', () => {
    const extensionsWithToc = [
      Document,
      Paragraph,
      Text,
      Heading,
      TableOfContents.configure({ anchorTypes: ['heading'] }),
    ]
    const docWithIds = generateTocIds(headingDoc, extensionsWithToc)

    const html = renderToHTMLString({ content: docWithIds, extensions: extensionsWithToc })

    expect(html).toMatch(/\bid="[^"]+"/)
    expect(html).toMatch(/data-toc-id="[^"]+"/)
  })
})
