/// <reference types="cypress" />

import {
  CodeBlockLowlight,
} from '@tiptap/extension-code-block-lowlight'
import { Text } from '@tiptap/extension-text'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Document } from '@tiptap/extension-document'
import { Editor } from '@tiptap/core'
import * as lowlight from 'lowlight'

describe('code block highlight', () => {
  let Frontmatter
  const editorElClass = 'tiptap'
  let editor: Editor

  const createEditorEl = () => {
    const editorEl = document.createElement('div')

    editorEl.classList.add(editorElClass)

    document.body.appendChild(editorEl)

    return editorEl
  }
  const getEditorEl = () => document.querySelector(`.${editorElClass}`)

  beforeEach(() => {
    Frontmatter = CodeBlockLowlight
      .configure({ lowlight })
      .extend({
        name: 'frontmatter',
      })

    editor = new Editor({
      element: createEditorEl(),
      extensions: [
        Document,
        Text,
        Paragraph,
        CodeBlockLowlight,
        Frontmatter,
      ],
      content: {
        type: 'doc',
        content: [
          {
            type: 'codeBlock',
            attrs: {
              language: 'javascript',
            },
            content: [{
              type: 'text',
              text: 'alert("Hello world");',
            }],
          },
          {
            type: 'frontmatter',
            attrs: {
              language: 'yaml',
            },
            content: [{
              type: 'text',
              text: '---\ntitle: Page title\n---',
            }],
          },
        ],
      },
    })
  })

  afterEach(() => {
    editor.destroy()
    getEditorEl()?.remove()
  })

  it('executes lowlight plugin in extensions that inherit from code-block-lowlight', () => {
    expect(getEditorEl()?.querySelector('.language-javascript .hljs-string')).not.to.eq(null)
    expect(getEditorEl()?.querySelector('.language-yaml .hljs-string')).not.to.eq(null)
  })
})
