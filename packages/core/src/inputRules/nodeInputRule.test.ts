import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { afterEach, describe, expect, it } from 'vite-plus/test'

import { Editor } from '../Editor.js'
import { Node } from '../Node.js'
import { nodeInputRule } from './nodeInputRule.js'

const Smiley = Node.create({
  name: 'smiley',
  group: 'inline',
  inline: true,
  atom: true,
  addAttributes: () => ({
    smiley: { default: null, renderHTML: a => ({ 'data-smiley': a.smiley }) },
  }),
  parseHTML: () => [{ tag: 'img[data-smiley]' }],
  renderHTML: ({ HTMLAttributes }) => ['img', HTMLAttributes],
  addInputRules() {
    return [
      nodeInputRule({
        find: /(?:^|\s)(:\))(\s)$/,
        type: this.type,
        getAttributes: match => ({ smiley: match[1] }),
      }),
    ]
  },
})

const type = (editor: Editor, text: string) => {
  for (const char of text) {
    const { from, to } = editor.state.selection
    const handled = editor.view.someProp('handleTextInput', f => f(editor.view, from, to, char))

    if (!handled) {
      editor.view.dispatch(editor.state.tr.insertText(char, from, to))
    }
  }
}

describe('nodeInputRule', () => {
  let editor: Editor

  afterEach(() => {
    editor.destroy()
  })

  it('inserts the typed character once when the rule has a capture group (#8513)', () => {
    editor = new Editor({ extensions: [Document, Paragraph, Text, Smiley], content: '<p></p>' })

    type(editor, 'a :) b')

    expect(editor.getHTML()).toBe('<p>a <img data-smiley=":)"> b</p>')
  })
})
