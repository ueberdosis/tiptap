import './styles.scss'
import 'katex/dist/katex.min.css'

import { createBlockMarkdownSpec, Node } from '@tiptap/core'
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details'
import { Highlight } from '@tiptap/extension-highlight'
import { Image } from '@tiptap/extension-image'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { Mathematics } from '@tiptap/extension-mathematics'
import { Mention } from '@tiptap/extension-mention'
import { TableKit } from '@tiptap/extension-table'
import { Youtube } from '@tiptap/extension-youtube'
import { Markdown } from '@tiptap/markdown'
import { EditorContent, NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useState } from 'react'

import { mdContent } from './content.js'

// Custom React component for demonstration
const CustomReactComponent = ({ node }: any) => {
  return (
    <NodeViewWrapper className="custom-react-node">
      <div
        style={{
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          padding: '16px',
          margin: '8px 0',
          backgroundColor: '#eff6ff',
        }}
      >
        <h4 style={{ margin: '0 0 8px 0', color: '#1e40af' }}>Custom React Component</h4>
        <p style={{ margin: 0, color: '#374151' }}>{node.attrs.content || 'This is a custom React node view!'}</p>
        <div>
          <NodeViewContent />
        </div>
      </div>
    </NodeViewWrapper>
  )
}

// Custom node extension with React node view
const CustomReactNode = Node.create({
  name: 'customReactNode',

  group: 'block',

  content: 'block+',

  addAttributes() {
    return {
      content: {
        default: 'This is a custom React node view!',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="custom-react-node"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'custom-react-node', ...HTMLAttributes }, 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CustomReactComponent)
  },

  markdownTokenName: 'customReactNode',

  ...createBlockMarkdownSpec({
    nodeName: 'customReactNode',
    name: 'react',
  }),
})

export default () => {
  const [markdownInput, setMarkdownInput] = useState(mdContent)
  const [error, setError] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [
      Markdown,
      StarterKit,
      Details,
      DetailsSummary,
      DetailsContent,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Youtube.configure({
        inline: false,
        width: 480,
        height: 320,
      }),
      Image,
      TableKit,
      Highlight,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: {
          items: ({ query }) => {
            return [
              'Lea Thompson',
              'Cyndi Lauper',
              'Tom Cruise',
              'Madonna',
              'Jerry Hall',
              'Joan Collins',
              'Winona Ryder',
              'Christina Applegate',
            ]
              .filter(item => item.toLowerCase().startsWith(query.toLowerCase()))
              .slice(0, 5)
          },
        },
      }),
      Mathematics,
      CustomReactNode,
    ],
    content: '# Markdown Test\n\nClick **"Parse Markdown"** to load content from the left panel.',
    contentType: 'markdown',
  })

  const parseMarkdown = () => {
    if (!editor || !editor.markdown) {
      setError('Editor or MarkdownManager not available')
      return
    }

    try {
      setError(null)
      editor.commands.setContent(markdownInput, { contentType: 'markdown' })
    } catch (err) {
      console.error(err)
      setError(`Error parsing markdown: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const getEditorAsMarkdown = () => {
    if (!editor) {
      return ''
    }

    try {
      return editor.getMarkdown()
    } catch {
      return editor.getText()
    }
  }

  const insertImage = () => {
    const url = prompt('Enter image URL:', 'https://unsplash.it/400/300')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const insertYoutube = () => {
    const url = prompt('Enter YouTube URL:', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    if (url && editor) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run()
    }
  }

  const insertMention = () => {
    const name = prompt('Enter mention name:', 'John Doe')
    if (name && editor) {
      // Generate a simple ID based on the name
      const id = Math.random().toString(36).substring(2, 9)
      editor.chain().focus().insertContent(`[@ id="${id}" label="${name}"]`, { contentType: 'markdown' }).run()
    }
  }

  const insertCustomReactNode = () => {
    const content = prompt('Enter content for custom React node:', 'Hello from React!')
    if (content && editor) {
      editor.chain().focus().insertContent(`:::react\n\n${content}\n\n:::`, { contentType: 'markdown' }).run()
    }
  }

  const insertInlineMath = () => {
    const latex = prompt('Enter LaTeX for inline math:', 'E = mc^2')
    if (latex && editor) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'inlineMath',
          attrs: { latex },
        })
        .run()
    }
  }

  const insertBlockMath = () => {
    const latex = prompt('Enter LaTeX for block math:', '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}')
    if (latex && editor) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'blockMath',
          attrs: { latex },
        })
        .run()
    }
  }

  return (
    <div className="markdown-parser-demo">
      <div className="control-group">
        <div className="button-group">
          <button type="button" onClick={parseMarkdown} disabled={!editor || !markdownInput.trim()}>
            Parse Markdown →
          </button>

          <button
            type="button"
            onClick={() => {
              if (editor) {
                const markdown = getEditorAsMarkdown()
                setMarkdownInput(markdown)
              }
            }}
          >
            ← Extract Markdown
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="split">
        <div className="input-panel">
          <div className="panel-label">Markdown Input</div>
          <textarea
            className="markdown-input"
            value={markdownInput}
            onChange={e => setMarkdownInput(e.target.value)}
            placeholder="Enter markdown here..."
          />
        </div>

        <div className="editor-panel">
          <div className="panel-label">Tiptap Editor</div>

          {/* Toolbar */}
          <div className="editor-toolbar button-group">
            <button type="button" onClick={insertImage} disabled={!editor} title="Insert Image">
              Insert Image
            </button>
            <button type="button" onClick={insertYoutube} disabled={!editor} title="Insert YouTube Video">
              Insert YouTube
            </button>
            <button type="button" onClick={insertMention} disabled={!editor} title="Insert Mention">
              Insert Mention
            </button>
            <button type="button" onClick={insertInlineMath} disabled={!editor} title="Insert Inline Math">
              Insert Inline Math
            </button>
            <button type="button" onClick={insertBlockMath} disabled={!editor} title="Insert Block Math">
              Insert Block Math
            </button>
            <button type="button" onClick={insertCustomReactNode} disabled={!editor} title="Insert Custom React Node">
              Insert React Node
            </button>
          </div>

          <div className="editor-container">
            {editor ? <EditorContent editor={editor} /> : <div>Loading editor…</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
