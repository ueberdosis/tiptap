/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import SearchNReplace from '@tiptap/extension-search-n-replace'
import './styles.scss'

export default () => {
  const editor = useEditor({
    extensions: [StarterKit, SearchNReplace],
    content: "<p>est for search and replace. search for 'amazing' and replace it with 'awe-inspiring'.</p><p></p><p><strong>tiptap is awesome</strong></p><p><strong>prosemirror is awesome</strong></p><p><strong>vue is awesome</strong></p><p><strong>react is awesome</strong></p>",
  })

  let searchTerm = ''

  let replaceTerm = ''

  const updateSearchTerm = (e = '') => {
    const val = e ? e.target.value : e
    searchTerm = val
    editor.commands.setSearchTerm(val)
  }

  const updateReplaceTerm = (e = '') => {
    const val = e ? e.target.value : e
    replaceTerm = val
    editor.commands.setReplaceTerm(val)
  }

  const clear = () => {
    searchTerm = ''
    replaceTerm = ''

    updateSearchTerm()
    updateReplaceTerm()
  }

  const replace = () => editor.commands.replace()

  const replaceAll = () => editor.commands.replaceAll()

  return (
    <>
      {editor && <section className="menubar">
        <input type="text" placeholder="Search term..." onInput={updateSearchTerm} />

        <input type="text" placeholder="Replace term..." onInput={updateReplaceTerm} onKeyPress={e => e.key === 'Enter' && replace()}/>

        <button onClick={() => clear()} >
          Clear
        </button>

        <button onClick={() => replace()} >
          Replace
        </button>

        <button onClick={() => replaceAll()}>
          Replace All
        </button>
      </section>}
      <EditorContent editor={editor} />
    </>
  )
}
