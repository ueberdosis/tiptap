import './styles.scss'

import type { JSONContent } from '@tiptap/react'
import { EditorProvider, useCurrentEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { renderToHTMLString, renderToMarkdown } from '@tiptap/static-renderer'
import { renderToReactElement } from '@tiptap/static-renderer/pm/react'
import React, { useState } from 'react'

const extensions = [StarterKit]

const content = `
<h2>
  Hi there,
</h2>
<p>
  this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
</p>
<ul>
  <li>
    That’s a bullet list with one …
  </li>
  <li>
    … or two list items.
  </li>
</ul>
<p>
  Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
</p>
<pre><code class="language-css">body {
  display: none;
}</code></pre>
<p>
  I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
</p>
<blockquote>
  Wow, that’s amazing. Good work, boy! 👏
  <br />
  — Mom
</blockquote>
`

/**
 * This example demonstrates how to render a Prosemirror Node (or JSON Content) to a React Element.
 * It will use your extensions to render the content based on each Node's/Mark's `renderHTML` method.
 * This can be useful if you want to render content to React without having an actual editor instance.
 *
 * You have complete control over the rendering process. And can replace how each Node/Mark is rendered.
 */
export default () => {
  const [tab, setTab] = useState<'react' | 'html' | 'html-element' | 'markdown'>('react')
  const [currentJSON, setJSON] = useState<JSONContent | null>(null)
  return (
    <div>
      <EditorProvider
        // eslint-disable-next-line @typescript-eslint/no-use-before-define -- Just want to show the usage first
        slotBefore={<MenuBar />}
        extensions={extensions}
        content={content}
        onUpdate={({ editor }) => {
          setJSON(editor.getJSON())
        }}
      ></EditorProvider>

      <div className="control-group">
        <h1>Rendered as:</h1>
        <div className="switch-group">
          <label>
            <input
              type="radio"
              name="option-switch"
              onChange={() => {
                setTab('react')
              }}
              checked={tab === 'react'}
            />
            React
          </label>
          <label>
            <input
              type="radio"
              name="option-switch"
              onChange={() => {
                setTab('html')
              }}
              checked={tab === 'html'}
            />
            HTML
          </label>
          <label>
            <input
              type="radio"
              name="option-switch"
              onChange={() => {
                setTab('html-element')
              }}
              checked={tab === 'html-element'}
            />
            HTML Element
          </label>
          <label>
            <input
              type="radio"
              name="option-switch"
              onChange={() => {
                setTab('markdown')
              }}
              checked={tab === 'markdown'}
            />
            Markdown
          </label>
        </div>
      </div>
      {tab === 'react' && (
        <div className="output-group tiptap">
          <h2>React Element</h2>
          <p>This example renders the JSON content directly into a React element without using an editor instance.</p>
          <p className="hint">Notice that every paragraph now has a button counter</p>
          <div className="tiptap">
            {currentJSON &&
              renderToReactElement({
                content: currentJSON,
                extensions,
                options: {
                  nodeMapping: {
                    paragraph: ({ node }) => {
                      // eslint-disable-next-line react-hooks/rules-of-hooks
                      const [count, setCount] = useState(0)
                      return (
                        <>
                          <button onClick={() => setCount(count + 1)} className="primary">
                            CLICK ME
                          </button>
                          <p>Count is: {count}</p>
                          <p>{node.textContent}</p>
                        </>
                      )
                    },
                  },
                },
              })}
          </div>
        </div>
      )}
      {tab === 'html' && (
        <div className="output-group tiptap">
          <h2>HTML String</h2>
          <p>
            This example renders the JSON content into an HTML string without using an editor instance or document
            parser.
          </p>
          <pre>
            <code>
              {currentJSON &&
                renderToHTMLString({
                  content: currentJSON,
                  extensions,
                })}
            </code>
          </pre>
        </div>
      )}
      {tab === 'html-element' && (
        <div className="output-group tiptap">
          <h2>To HTML Element (via dangerouslySetInnerHTML)</h2>
          <p>
            This example renders the JSON content into an HTML string without using an editor instance or document
            parser, and places that result directly into the HTML using dangerouslySetInnerHTML.
          </p>
          <div
            className="tiptap"
            dangerouslySetInnerHTML={{
              __html: currentJSON
                ? renderToHTMLString({
                    content: currentJSON,
                    extensions,
                  })
                : '',
            }}
          ></div>
        </div>
      )}
      {tab === 'markdown' && (
        <div className="output-group tiptap">
          <h2>Markdown</h2>
          <p>
            This example renders the JSON content into a markdown without using an editor instance, document parser or
            markdown library.
          </p>
          <pre>
            <code>
              {currentJSON &&
                renderToMarkdown({
                  content: currentJSON,
                  extensions,
                })}
            </code>
          </pre>
        </div>
      )}
    </div>
  )
}

function MenuBar() {
  const { editor } = useCurrentEditor()

  const editorState = useEditorState({
    editor: editor!,
    selector: ctx => {
      return {
        isBold: ctx.editor.isActive('bold'),
        canBold: ctx.editor.can().chain().focus().toggleBold().run(),
        isItalic: ctx.editor.isActive('italic'),
        canItalic: ctx.editor.can().chain().focus().toggleItalic().run(),
        isStrike: ctx.editor.isActive('strike'),
        canStrike: ctx.editor.can().chain().focus().toggleStrike().run(),
        isCode: ctx.editor.isActive('code'),
        canCode: ctx.editor.can().chain().focus().toggleCode().run(),
        canClearMarks: ctx.editor.can().chain().focus().unsetAllMarks().run(),
        isParagraph: ctx.editor.isActive('paragraph'),
        isHeading1: ctx.editor.isActive('heading', { level: 1 }),
        isHeading2: ctx.editor.isActive('heading', { level: 2 }),
        isHeading3: ctx.editor.isActive('heading', { level: 3 }),
        isHeading4: ctx.editor.isActive('heading', { level: 4 }),
        isHeading5: ctx.editor.isActive('heading', { level: 5 }),
        isHeading6: ctx.editor.isActive('heading', { level: 6 }),
        isBulletList: ctx.editor.isActive('bulletList'),
        isOrderedList: ctx.editor.isActive('orderedList'),
        isCodeBlock: ctx.editor.isActive('codeBlock'),
        isBlockquote: ctx.editor.isActive('blockquote'),
        canUndo: ctx.editor.can().chain().focus().undo().run(),
        canRedo: ctx.editor.can().chain().focus().redo().run(),
      }
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="control-group">
      <div className="button-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editorState.canBold}
          className={editorState.isBold ? 'is-active' : ''}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editorState.canItalic}
          className={editorState.isItalic ? 'is-active' : ''}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editorState.canStrike}
          className={editorState.isStrike ? 'is-active' : ''}
        >
          Strike
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editorState.canCode}
          className={editorState.isCode ? 'is-active' : ''}
        >
          Code
        </button>
        <button onClick={() => editor.chain().focus().unsetAllMarks().run()}>Clear marks</button>
        <button onClick={() => editor.chain().focus().clearNodes().run()}>Clear nodes</button>
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editorState.isParagraph ? 'is-active' : ''}
        >
          Paragraph
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editorState.isHeading1 ? 'is-active' : ''}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editorState.isHeading2 ? 'is-active' : ''}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editorState.isHeading3 ? 'is-active' : ''}
        >
          H3
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={editorState.isHeading4 ? 'is-active' : ''}
        >
          H4
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={editorState.isHeading5 ? 'is-active' : ''}
        >
          H5
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          className={editorState.isHeading6 ? 'is-active' : ''}
        >
          H6
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editorState.isBulletList ? 'is-active' : ''}
        >
          Bullet list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editorState.isOrderedList ? 'is-active' : ''}
        >
          Ordered list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editorState.isCodeBlock ? 'is-active' : ''}
        >
          Code block
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editorState.isBlockquote ? 'is-active' : ''}
        >
          Blockquote
        </button>
        <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>Horizontal rule</button>
        <button onClick={() => editor.chain().focus().setHardBreak().run()}>Hard break</button>
        <button onClick={() => editor.chain().focus().undo().run()} disabled={!editorState.canUndo}>
          Undo
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} disabled={!editorState.canRedo}>
          Redo
        </button>
      </div>
    </div>
  )
}
