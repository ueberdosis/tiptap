import Editor from '../src/Utils/Editor'

import {
  Blockquote,
  CodeBlock,
  HardBreak,
  Heading,
  OrderedList,
  BulletList,
  ListItem,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Link,
  Strike,
  Underline,
  History,
} from '../../tiptap-extensions'

test('can create editor', () => {
  const editor = new Editor()

  expect(editor).toBeDefined()
})

test('set HTML, get HTML', () => {
  const result = '<p>Lorem <strong>ipsum</strong> dolor sit amet.</p>'

  const editor = new Editor({
    content: result,
    extensions: [
      new Bold(),
    ],
  })

  expect(editor.getHTML()).toEqual(result)
})

test('set HTML, get JSON', () => {
  const editor = new Editor({
    content: '<p>Lorem <strong>ipsum</strong> dolor sit amet.</p>',
    extensions: [
      new Bold(),
    ],
  })

  const result = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Lorem ',
          },
          {
            type: 'text',
            marks: [
              {
                type: 'bold',
              },
            ],
            text: 'ipsum',
          },
          {
            type: 'text',
            text: ' dolor sit amet.',
          },
        ],
      },
    ],
  }

  expect(editor.getJSON()).toEqual(result)
})

test('set JSON, get JSON', () => {
  const result = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Lorem ',
          },
          {
            type: 'text',
            marks: [
              {
                type: 'bold',
              },
            ],
            text: 'ipsum',
          },
          {
            type: 'text',
            text: ' dolor sit amet.',
          },
        ],
      },
    ],
  }

  const editor = new Editor({
    content: result,
    extensions: [
      new Bold(),
    ],
  })

  expect(editor.getJSON()).toEqual(result)
})

test('set JSON, get HTML', () => {
  const content = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Lorem ',
          },
          {
            type: 'text',
            marks: [
              {
                type: 'bold',
              },
            ],
            text: 'ipsum',
          },
          {
            type: 'text',
            text: ' dolor sit amet.',
          },
        ],
      },
    ],
  }
  const result = '<p>Lorem <strong>ipsum</strong> dolor sit amet.</p>'

  const editor = new Editor({
    content,
    extensions: [
      new Bold(),
    ],
  })

  expect(editor.getHTML()).toEqual(result)
})
