import './styles.scss'

import Image from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'
import { Markdown } from '@tiptap/markdown'
import {
  createAtomBlockMarkdownSpec,
  createBlockMarkdownSpec,
  createInlineMarkdownSpec,
  Mark,
  Node,
  Tiptap,
  useEditor,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState } from 'react'

const CustomNode = Node.create({
  name: 'custom',
  group: 'block',
  content: 'block*',

  renderHTML() {
    return ['div', { 'data-type': 'custom' }, 0]
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="custom"]',
      },
    ]
  },

  ...createBlockMarkdownSpec({
    nodeName: 'custom',
    content: 'block',
  }),
})

const CustomAtom = Node.create({
  name: 'customAtom',
  group: 'block',
  atom: true,

  renderHTML() {
    return ['div', { 'data-type': 'atom' }]
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="atom"]',
      },
    ]
  },

  addNodeView() {
    return () => {
      const el = document.createElement('div')
      el.setAttribute('data-type', 'atom')
      el.textContent = 'This is an atom node.'

      return {
        dom: el,
      }
    }
  },

  ...createAtomBlockMarkdownSpec({
    nodeName: 'atom',
  }),
})

const CustomInline = Node.create({
  name: 'customInline',
  group: 'inline',
  inline: true,
  content: 'inline*',

  renderHTML() {
    return ['span', { 'data-type': 'inline' }, 0]
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="inline"]',
      },
    ]
  },

  ...createInlineMarkdownSpec({
    nodeName: 'customInline',
    content: 'inline',
  }),
})

const CustomMark = Mark.create({
  name: 'customMark',

  renderHTML() {
    return ['span', { 'data-type': 'mark' }, 0]
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="mark"]',
      },
    ]
  },

  renderMarkdown(node, helpers) {
    return `=>${helpers.renderChildren(node)}<=`
  },

  parseMarkdown(token, helpers) {
    return {
      type: this.name,
      content: helpers.applyMark('customMark', helpers.parseInline(token.tokens || [])),
    }
  },

  markdownTokenizer: {
    name: 'customMark',
    level: 'inline',
    start(src) {
      return src.indexOf('=>')
    },
    tokenize(src, _tokens, lexer) {
      const rule = /^(=>)([\s\S]+?)(<=)/
      const match = rule.exec(src)

      if (!match) {
        return undefined
      }

      const innerContent = match[2].trim()

      return {
        type: 'customMark',
        raw: match[0],
        text: innerContent,
        tokens: lexer.inlineTokens(innerContent),
      }
    },
  },
})

export default () => {
  const [serializedContent, setSerializedContent] = useState('')
  const editor = useEditor({
    extensions: [Markdown, StarterKit, Image, TableKit, CustomNode, CustomAtom, CustomInline, CustomMark],
    content: `
      <p>In this demo, you can see how to define custom syntax for Markdown.</p>
      <div data-type="custom">
        <p>This is a custom node.</p>
      </div>
      <div data-type="custom">
        <p>We also support nested nodes.</p>

        <div data-type="custom">
          <p>This is a custom node.</p>
        </div>
      </div>
      <div data-type="atom"></div>
      <p>
        This is a <span data-type="mark">paragraph</span> with a <span data-type="inline">custom inline node</span>.
      </p>
      <p>Feel free to edit this document to see the live-changes.</p>
    `,
    onUpdate: ({ editor: currentEditor }) => {
      setSerializedContent(currentEditor.getMarkdown())
    },
    onCreate: ({ editor: currentEditor }) => {
      setSerializedContent(currentEditor.getMarkdown())
    },
  })

  return (
    <>
      <div className="grid">
        <Tiptap instance={editor}>
          <Tiptap.Content className="editor-wrapper" />
        </Tiptap>
        <div className="preview">
          <pre>{serializedContent}</pre>
        </div>
      </div>
    </>
  )
}
