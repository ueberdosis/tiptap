import './styles.scss'

import { elementFromString, Node } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useCallback, useEffect, useState } from 'react'

const UnknownNode = Node.create({
  name: 'unknownNode',

  priority: Number.MIN_SAFE_INTEGER,

  addAttributes() {
    return {
      tagName: {
        default: 'unknown-tag',
        parseHTML: node => {
          const tagName = node.tagName

          if (tagName === 'UNKNOWN-NODE') {
            return node.getAttribute('tagname')
          }
          return tagName
        },
      },
      innerHTML: {
        default: null,
        parseHTML: node => {
          const tagName = node.tagName

          if (tagName === 'UNKNOWN-NODE') {
            return node.getAttribute('innerhtml')
          }
          return node.innerHTML
        },
      },
      attributes: {
        default: {},
        parseHTML: node => {
          const tagName = node.tagName

          if (tagName === 'UNKNOWN-NODE') {
            return node.getAttribute('attributes')
          }

          return JSON.stringify(node.getAttributeNames().reduce((acc, name) => {
            acc[name] = node.getAttribute(name)
            return acc
          }, {}))
        },
      },
    }
  },

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [
      {
        tag: 'unknown-node[tagName]',
        getAttrs: dom => {
          return {
            attributes: dom.getAttribute('attributes'),
            tagName: dom.getAttribute('tagName'),
            innerHTML: dom.getAttribute('innerHTML'),
          }
        },
      },
      {
        tag: '*',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [HTMLAttributes.tagName, JSON.parse(HTMLAttributes.attributes), HTMLAttributes.innerHTML]
  },

})
const MyCustomNode = Node.create({
  name: 'myCustomNode',
  priority: 1000,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {

    return {
      attribute: {
        default: null,
      },
    }
  },

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [
      {
        tag: 'my-custom-node',
      },
      {
        tag: 'unknown-node[tagName="MY-CUSTOM-NODE"]',
        getAttrs: dom => {
          try {
            return JSON.parse(dom.getAttribute('attributes'))
          } catch (error) {
            return {}
          }
        },
        contentElement: node => {
          const innerHTML = node.getAttribute('innerHTML')

          if (!innerHTML) {
            return null
          }

          return elementFromString(innerHTML)
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['my-custom-node', HTMLAttributes, 0]
  },

})
const isElementKnown = true
const useErroredSave = true

export default () => {
  const [json, setJson] = useState(null)
  const editor = useEditor({
    content: useErroredSave ? `
        <p>
          Wow, this editor instance exports its content as JSON.
        </p>
        <unknown-node
          tagname="MY-CUSTOM-NODE"
          innerhtml="It’s a great way to store and load documents."
          attributes="{&quot;attribute&quot;:&quot;abc&quot;}"
        >
          We don't know what this is
        </unknown-node>` : `
        <p>
          Wow, this editor instance exports its content as JSON.
        </p>
        <my-custom-node attribute="abc">It’s a great way to store and load documents.</my-custom-node>
      `,
    extensions: [
      StarterKit,
      isElementKnown ? MyCustomNode : false,
      UnknownNode,
    ].filter(Boolean),
  })

  useEffect(() => {
    if (!editor) {
      return undefined
    }

    // Get the initial content …
    setJson(editor.getJSON())

    // … and get the content after every change.
    editor.on('update', () => {
      setJson(editor.getJSON())
    })
  }, [editor])

  const setContent = useCallback(() => {
    // You can pass a JSON document to the editor.
    editor.commands.setContent(
      {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'It’s 19871. You can’t turn on a radio, or go to a mall without hearing Olivia Newton-John’s hit song, Physical.',
              },
            ],
          },
        ],
      },
      true,
    )

    // It’s likely that you’d like to focus the Editor after most commands.
    editor.commands.focus()
  }, [editor])

  const clearContent = useCallback(() => {
    editor.chain().clearContent(true).focus().run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="actions">
        <button className="button" onClick={setContent}>
          Set Content
        </button>
        <button className="button" onClick={clearContent}>
          Clear Content
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          Italic
        </button>
      </div>

      <EditorContent editor={editor} />

      <div className="export">
        <h3>JSON</h3>
        <pre>
          <code>{JSON.stringify(json, null, 2)}</code>
        </pre>
      </div>
    </>
  )
}
