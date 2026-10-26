import { prettyDOM, render } from '@testing-library/react'
import Bold from '@tiptap/extension-bold'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { Mark, Node as PMNode } from '@tiptap/pm/model'
import { mapAttrsToHTMLAttributes, renderToReactElement } from './react.js'
import React from 'react'
import { describe, expect, it } from 'vite-plus/test'

describe('static renderer: react', () => {
  it('mapAttrsToHTMLAttributes maps attributes to React attributes', () => {
    const attrs = {
      class: 'my-class',
      style: 'color: red; font-size: 16px; transform: translateX(15px) translateY(10px);',
      id: 'my-id',
      colspan: 2,
      rowspan: 3,
    }

    const result = mapAttrsToHTMLAttributes(attrs, 'test-key')

    expect(result).toEqual({
      className: 'my-class',
      style: { color: 'red', fontSize: '16px', transform: 'translateX(15px) translateY(10px)' },
      id: 'my-id',
      colSpan: 2,
      rowSpan: 3,
      key: 'test-key',
    })
  })

  it('preserves CSS custom property names and their casing', () => {
    const result = mapAttrsToHTMLAttributes({
      style: '--my-color: red; --MyColor: blue; font-size: 16px;',
    })

    expect(result.style).toEqual({
      '--my-color': 'red',
      '--MyColor': 'blue',
      fontSize: '16px',
    })
  })

  it('preserves colons inside style values', () => {
    const result = mapAttrsToHTMLAttributes({
      style: 'background-image: url("https://example.com:8443/a.png"); color: red;',
    })

    expect(result.style).toEqual({
      backgroundImage: 'url("https://example.com:8443/a.png")',
      color: 'red',
    })
  })

  it.each([
    {
      name: 'quoted SVG data URLs',
      style: 'background-image: url("data:image/svg+xml;base64,PHN2Zy8+"); color: red;',
      expected: {
        backgroundImage: 'url("data:image/svg+xml;base64,PHN2Zy8+")',
        color: 'red',
      },
    },
    {
      name: 'unquoted SVG data URLs',
      style: 'background-image: url(data:image/svg+xml;base64,PHN2Zy8+); color: red;',
      expected: {
        backgroundImage: 'url(data:image/svg+xml;base64,PHN2Zy8+)',
        color: 'red',
      },
    },
    {
      name: 'quoted semicolons',
      style: 'font-family: "A; B"; color: red;',
      expected: { fontFamily: '"A; B"', color: 'red' },
    },
    {
      name: 'escaped quotes',
      style: String.raw`--label: "a\";b"; color: red;`,
      expected: { '--label': String.raw`"a\";b"`, color: 'red' },
    },
    {
      name: 'escaped semicolons',
      style: String.raw`--label: a\;b; color: red;`,
      expected: { '--label': String.raw`a\;b`, color: 'red' },
    },
    {
      name: 'CSS comments',
      style: '/* theme; */ color: red; font-size: /* size */ 16px;',
      expected: { color: 'red', fontSize: '16px' },
    },
    {
      name: 'comment markers inside strings',
      style: '--label: "/* a;b */"; color: red;',
      expected: { '--label': '"/* a;b */"', color: 'red' },
    },
    {
      name: 'comment markers inside unquoted URLs',
      style: 'background-image: url(https://example.com/a/*image*/b.png); color: red;',
      expected: {
        backgroundImage: 'url(https://example.com/a/*image*/b.png)',
        color: 'red',
      },
    },
    {
      name: 'non-ASCII function names ending in url',
      style: '--theme: éurl(a(b); c); --other: \u{1D49C}url(x(y); z); color: red;',
      expected: {
        '--theme': 'éurl(a(b); c)',
        '--other': '\u{1D49C}url(x(y); z)',
        color: 'red',
      },
    },
    {
      name: 'nested values',
      style: '--spacing: calc((1px + 2px) * 2); --theme: { color: red; }; color: blue;',
      expected: {
        '--spacing': 'calc((1px + 2px) * 2)',
        '--theme': '{ color: red; }',
        color: 'blue',
      },
    },
  ])('preserves $name', ({ style, expected }) => {
    expect(mapAttrsToHTMLAttributes({ style }).style).toEqual(expected)
  })
})

describe('static render json to react elements (with prosemirror)', () => {
  it('keeps custom properties and complete SVG data URLs when mounting a styled mark', () => {
    const styledBold = Bold.configure({
      HTMLAttributes: {
        style:
          'color: red; --my-color: red; background-image: url("data:image/svg+xml;base64,PHN2Zy8+");',
      },
    })
    const view = render(
      renderToReactElement({
        extensions: [Document, Paragraph, Text, styledBold],
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Styled text', marks: [{ type: 'bold' }] }],
            },
          ],
        },
      }),
    )
    const mark = view.getByText('Styled text')

    expect(mark.style.getPropertyValue('--my-color')).toBe('red')
    expect(mark.style.color).toBe('red')
    expect(mark.style.backgroundImage).toContain('data:image/svg+xml;base64,PHN2Zy8+')
  })

  it('generates a React element from JSON without an editor instance', () => {
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

    const view = render(
      renderToReactElement({
        content: json,
        extensions: [Document, Paragraph, Text, Bold],
      }),
    )
    const html = prettyDOM(view.container, undefined, { highlight: false })

    expect(html).toBe(`<div>
  <p>
    <strong>
      Example Text
    </strong>
  </p>
</div>`)
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

    const view = render(
      renderToReactElement({
        content: json,
        extensions: [Document, Paragraph, Text, Bold],
        options: {
          nodeMapping: {
            doc: ({ children }) => {
              return React.createElement('doc', {}, children)
            },
          },
          markMapping: {
            bold: ({ children }) => {
              return React.createElement('b', {}, children)
            },
          },
        },
      }),
    )
    const html = prettyDOM(view.container, undefined, { highlight: false })

    expect(html).toBe(`<div>
  <doc>
    <p>
      <b>
        Example Text
      </b>
    </p>
  </doc>
</div>`)
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

    const view = render(
      renderToReactElement({
        content: json,
        extensions: [Document, Paragraph, Text, Bold],
        options: {
          nodeMapping: {
            doc: ({ children, node }) => {
              expect(node.type.name).toBe('doc')
              expect(node).toBeInstanceOf(PMNode)
              return React.createElement('doc', {}, children)
            },
          },
          markMapping: {
            bold: ({ children, mark }) => {
              expect(mark.type.name).toBe('bold')
              expect(mark).toBeInstanceOf(Mark)
              return React.createElement('b', {}, children)
            },
          },
        },
      }),
    )
    const html = prettyDOM(view.container, undefined, { highlight: false })

    expect(html).toBe(`<div>
  <doc>
    <p>
      <b>
        Example Text
      </b>
    </p>
  </doc>
</div>`)
  })

  it('honors textDirection via staticEditorOptions', () => {
    const json = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'test' }],
        },
      ],
    }

    const view = render(
      renderToReactElement({
        content: json,
        extensions: [Document, Paragraph, Text, Heading],
        staticEditorOptions: { textDirection: 'rtl' },
      }),
    )

    const heading = view.container.querySelector('h1')
    expect(heading?.getAttribute('dir')).toBe('rtl')
  })
})
