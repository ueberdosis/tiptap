import React, { useState } from 'react'
import tippy from 'tippy.js'
import { useEditor, EditorContent, ReactRenderer, ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { defaultExtensions } from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import Mention from '@tiptap/extension-mention'
import './styles.scss'
import { render } from 'react-dom'

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null
  }

  return (
    <>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'is-active' : ''}
      >
        strike
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={editor.isActive('code') ? 'is-active' : ''}
      >
        code
      </button>
      <button onClick={() => editor.chain().focus().unsetAllMarks().run()}>
        clear marks
      </button>
      <button onClick={() => editor.chain().focus().clearNodes().run()}>
        clear nodes
      </button>
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={editor.isActive('paragraph') ? 'is-active' : ''}
      >
        paragraph
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
      >
        h1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
      >
        h2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
      >
        h3
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}
      >
        h4
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        className={editor.isActive('heading', { level: 5 }) ? 'is-active' : ''}
      >
        h5
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
        className={editor.isActive('heading', { level: 6 }) ? 'is-active' : ''}
      >
        h6
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
      >
        bullet list
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
      >
        ordered list
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive('codeBlock') ? 'is-active' : ''}
      >
        code block
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'is-active' : ''}
      >
        blockquote
      </button>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        horizontal rule
      </button>
      <button onClick={() => editor.chain().focus().setHardBreak().run()}>
        hard break
      </button>
      <button onClick={() => editor.chain().focus().undo().run()}>
        undo
      </button>
      <button onClick={() => editor.chain().focus().redo().run()}>
        redo
      </button>
    </>
  )
}

const MentionList = (props) => {
  console.log({props})

  return (
    <div>
      mentions
      {props.items.map((item) => (
        <div>
          {item}
        </div>
      ))}
    </div>
  )
}

class MentionList2 extends React.Component {

  onKeyDown(props) {
    console.log('onKeyDown', props)
  }

  render() {
    return (
      <div>
        mentions
        {this.props.items.map((item, index) => (
          <div key={index}>
            {item}
          </div>
        ))}
      </div>
    )
  }
}

export default () => {
  const [isVisible, setVisible] = useState(true)

  const editor = useEditor({
    // onTransaction({ editor }) {
    //   console.log('anchor', editor.state.selection.anchor)
    // },
    extensions: [
      ...defaultExtensions().filter(item => item.config.name !== 'heading'),
      Heading.extend({
        draggable: true,
        addNodeView() {
          return ReactNodeViewRenderer((props) => {
            return (
              <NodeViewWrapper>
                <div className="heading">
                  <span
                    data-drag-handle
                    contentEditable={false}
                    draggable={true}
                    suppressContentEditableWarning={true}
                  >⠿</span>
                  level: {props.node.attrs.level}
                  <button onClick={() => props.updateAttributes({ level: 1 })}>
                    set level 1
                  </button>
                  <NodeViewContent />
                </div>
              </NodeViewWrapper>
            )
          })
        }
      }),
      Mention.configure({
        suggestion: {
          items: query => {
            return [
              'Lea Thompson', 'Cyndi Lauper', 'Tom Cruise', 'Madonna', 'Jerry Hall', 'Joan Collins', 'Winona Ryder', 'Christina Applegate', 'Alyssa Milano', 'Molly Ringwald', 'Ally Sheedy', 'Debbie Harry', 'Olivia Newton-John', 'Elton John', 'Michael J. Fox', 'Axl Rose', 'Emilio Estevez', 'Ralph Macchio', 'Rob Lowe', 'Jennifer Grey', 'Mickey Rourke', 'John Cusack', 'Matthew Broderick', 'Justine Bateman', 'Lisa Bonet',
            ].filter(item => item.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10)
          },
          render: () => {
            let reactRenderer
            let popup

            return {
              onStart: props => {
                reactRenderer = new ReactRenderer(MentionList2, {
                  props,
                  editor: props.editor,
                })

                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: reactRenderer.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                })
              },
              onUpdate(props) {
                reactRenderer.updateProps(props)

                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                })
              },
              onKeyDown(props) {
                return reactRenderer.ref.onKeyDown(props)
              },
              onExit() {
                popup[0].destroy()
                reactRenderer.destroy()
              },
            }
          }
        },
      })
    ],
    content: `
      <h1>heading</h1>
      <h2>heading</h2>
      <p>paragraph</p>
    `,
//     content: `
//       <h2>
//         Hi there,
//       </h2>
//       <p>
//         this is a basic <em>basic</em> example of <strong>tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
//       </p>
//       <ul>
//         <li>
//           That’s a bullet list with one …
//         </li>
//         <li>
//           … or two list items.
//         </li>
//       </ul>
//       <p>
//         Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
//       </p>
//       <pre><code class="language-css">body {
//   display: none;
// }</code></pre>
//       <p>
//         I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
//       </p>
//       <blockquote>
//         Wow, that’s amazing. Good work, boy! 👏
//         <br />
//         — Mom
//       </blockquote>
//     `,
  })

  return (
    <div>
      <div>
        <button onClick={() => setVisible(true)}>visible</button>
        <button onClick={() => setVisible(false)}>hidden</button>
      </div>
      <div>
        <button onClick={() => editor.setEditable(true)}>editable</button>
        <button onClick={() => editor.setEditable(false)}>readonly</button>
      </div>
      <MenuBar editor={editor} />
      {isVisible && <EditorContent editor={editor} />}
    </div>
  )
}
