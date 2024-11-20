import './styles.scss'

import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import { MarkdownSerializer } from '@tiptap/pm/markdown'
import { EditorProvider, useCurrentEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useEffect } from 'react'

function backticksFor(node, side) {
  const ticks = /`+/g; let m; let
    len = 0

  if (node.isText) { while (m = ticks.exec(node.text)) { len = Math.max(len, m[0].length) } }
  let result = len > 0 && side > 0 ? ' `' : '`'

  for (let i = 0; i < len; i++) { result += '`' }
  if (len > 0 && side < 0) { result += ' ' }
  return result
}

function isPlainURL(link, parent, index) {
  if (link.attrs.title || !/^\w+:/.test(link.attrs.href)) { return false }
  const content = parent.child(index)

  if (!content.isText || content.text != link.attrs.href || content.marks[content.marks.length - 1] != link) { return false }
  return index == parent.childCount - 1 || !link.isInSet(parent.child(index + 1).marks)
}

const MenuBar = () => {
  const { editor } = useCurrentEditor()

  useEffect(() => {
    if (!editor) {
      return
    }
    const serializer = new MarkdownSerializer({
      blockquote(state, node) {
        state.wrapBlock('> ', null, node, () => state.renderContent(node))
      },
      codeBlock(state, node) {
        // Make sure the front matter fences are longer than any dash sequence within it
        const backticks = node.textContent.match(/`{3,}/gm)
        const fence = backticks ? (`${backticks.sort().slice(-1)[0]}\``) : '```'

        state.write(`${fence + (node.attrs.params || '')}\n`)
        state.text(node.textContent, false)
        // Add a newline to the current content before adding closing marker
        state.write('\n')
        state.write(fence)
        state.closeBlock(node)
      },
      heading(state, node) {
        state.write(`${state.repeat('#', node.attrs.level)} `)
        state.renderInline(node, false)
        state.closeBlock(node)
      },
      horizontalRule(state, node) {
        state.write(node.attrs.markup || '---')
        state.closeBlock(node)
      },
      bulletList(state, node) {
        state.renderList(node, '  ', () => `${node.attrs.bullet || '*'} `)
      },
      orderedList(state, node) {
        const start = node.attrs.order || 1
        const maxW = String(start + node.childCount - 1).length
        const space = state.repeat(' ', maxW + 2)

        state.renderList(node, space, i => {
          const nStr = String(start + i)

          return `${state.repeat(' ', maxW - nStr.length) + nStr}. `
        })
      },
      listItem(state, node) {
        state.renderContent(node)
      },
      paragraph(state, node) {
        state.renderInline(node)
        state.closeBlock(node)
      },

      image(state, node) {
        state.write(`![${state.esc(node.attrs.alt || '')}](${node.attrs.src.replace(/[\(\)]/g, '\\$&')
        }${node.attrs.title ? ` "${node.attrs.title.replace(/"/g, '\\"')}"` : ''})`)
      },
      hardBreak(state, node, parent, index) {
        for (let i = index + 1; i < parent.childCount; i++) {
          if (parent.child(i).type != node.type) {
            state.write('\\\n')
            return
          }
        }
      },
      text(state, node) {
        state.text(node.text, !state.inAutolink)
      },
    }, {
      italic: {
        open: '*', close: '*', mixable: true, expelEnclosingWhitespace: true,
      },
      bold: {
        open: '**', close: '**', mixable: true, expelEnclosingWhitespace: true,
      },
      link: {
        open(state, mark, parent, index) {
          state.inAutolink = isPlainURL(mark, parent, index)
          return state.inAutolink ? '<' : '['
        },
        close(state, mark, parent, index) {
          const { inAutolink } = state

          state.inAutolink = undefined
          return inAutolink ? '>'
            : `](${mark.attrs.href.replace(/[\(\)"]/g, '\\$&')}${mark.attrs.title ? ` "${mark.attrs.title.replace(/"/g, '\\"')}"` : ''})`
        },
        mixable: true,
      },
      code: {
        open(_state, _mark, parent, index) { return backticksFor(parent.child(index), -1) },
        close(_state, _mark, parent, index) { return backticksFor(parent.child(index - 1), 1) },
        escape: false,
      },
    })

    console.log(serializer.serialize(editor.state.doc))
    // editor
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className="control-group">
      <div className="button-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleStrike()
              .run()
          }
          className={editor.isActive('strike') ? 'is-active' : ''}
        >
          Strike
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleCode()
              .run()
          }
          className={editor.isActive('code') ? 'is-active' : ''}
        >
          Code
        </button>
        <button onClick={() => editor.chain().focus().unsetAllMarks().run()}>
          Clear marks
        </button>
        <button onClick={() => editor.chain().focus().clearNodes().run()}>
          Clear nodes
        </button>
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive('paragraph') ? 'is-active' : ''}
        >
          Paragraph
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
        >
          H3
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}
        >
          H4
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={editor.isActive('heading', { level: 5 }) ? 'is-active' : ''}
        >
          H5
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          className={editor.isActive('heading', { level: 6 }) ? 'is-active' : ''}
        >
          H6
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
        >
          Bullet list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
        >
          Ordered list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'is-active' : ''}
        >
          Code block
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
        >
          Blockquote
        </button>
        <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          Horizontal rule
        </button>
        <button onClick={() => editor.chain().focus().setHardBreak().run()}>
          Hard break
        </button>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .undo()
              .run()
          }
        >
          Undo
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .redo()
              .run()
          }
        >
          Redo
        </button>
        <button
          onClick={() => editor.chain().focus().setColor('#958DF1').run()}
          className={editor.isActive('textStyle', { color: '#958DF1' }) ? 'is-active' : ''}
        >
          Purple
        </button>
      </div>
    </div>
  )
}

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle.configure({ types: [ListItem.name] }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
  }),
]

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

export default () => {
  return (
    <EditorProvider slotBefore={<MenuBar />} extensions={extensions} content={content}></EditorProvider>
  )
}
