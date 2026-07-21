import './styles.scss'

import Document from '@tiptap/extension-document'
import FindAndReplace from '@tiptap/extension-find-and-replace'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import React from 'react'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, FindAndReplace],
    content: `
      <p>
        Find and replace is one of those features you only miss once it is gone.
        Try searching for "tiptap" in this text. Tiptap highlights every match
        right inside the editor, no matter if it is written as tiptap, Tiptap
        or even TIPTAP.
      </p>
      <p>
        Toggle "Match case" to only find exact matches. Enable "Regex" and search
        for colou?r to find both color and colour at once. Hit "Replace" to swap
        the current match and jump straight to the next one.
      </p>
    `,
  })

  const { searchTerm, replaceTerm, caseSensitive, useRegex, wholeWord, resultCount, currentIndex } =
    useEditorState({
      editor,
      selector: ctx => ({
        searchTerm: ctx.editor.storage.findAndReplace.searchTerm,
        replaceTerm: ctx.editor.storage.findAndReplace.replaceTerm,
        caseSensitive: ctx.editor.storage.findAndReplace.caseSensitive,
        useRegex: ctx.editor.storage.findAndReplace.useRegex,
        wholeWord: ctx.editor.storage.findAndReplace.wholeWord,
        resultCount: ctx.editor.storage.findAndReplace.results.length,
        currentIndex: ctx.editor.storage.findAndReplace.currentIndex,
      }),
    })

  if (!editor) {
    return null
  }

  const onSearchKeyDown = event => {
    if (event.key !== 'Enter') {
      return
    }

    if (event.shiftKey) {
      editor.commands.goToPreviousResult()
    } else {
      editor.commands.goToNextResult()
    }
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <input
            type="text"
            placeholder="Search"
            aria-label="Search"
            value={searchTerm}
            onChange={event => editor.commands.setSearchTerm(event.currentTarget.value)}
            onKeyDown={onSearchKeyDown}
            data-testid="search-input"
          />
          <input
            type="text"
            placeholder="Replace"
            aria-label="Replace"
            value={replaceTerm}
            onChange={event => editor.commands.setReplaceTerm(event.currentTarget.value)}
            data-testid="replace-input"
          />
          <label>
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={event => editor.commands.setCaseSensitive(event.currentTarget.checked)}
              data-testid="case-sensitive-checkbox"
            />
            Match case
          </label>
          <label>
            <input
              type="checkbox"
              checked={wholeWord}
              disabled={useRegex}
              onChange={event => editor.commands.setWholeWord(event.currentTarget.checked)}
              data-testid="whole-word-checkbox"
            />
            Whole word
          </label>
          <label>
            <input
              type="checkbox"
              checked={useRegex}
              onChange={event => editor.commands.setUseRegex(event.currentTarget.checked)}
              data-testid="regex-checkbox"
            />
            Regex
          </label>
        </div>
        <div className="button-group">
          <button
            onClick={() => editor.commands.goToPreviousResult()}
            disabled={resultCount === 0}
            data-testid="previous-button"
          >
            Previous
          </button>
          <button
            onClick={() => editor.commands.goToNextResult()}
            disabled={resultCount === 0}
            data-testid="next-button"
          >
            Next
          </button>
          <button
            onClick={() => editor.commands.replace()}
            disabled={resultCount === 0}
            data-testid="replace-button"
          >
            Replace
          </button>
          <button
            onClick={() => editor.commands.replaceAll()}
            disabled={resultCount === 0}
            data-testid="replace-all-button"
          >
            Replace all
          </button>
          <button onClick={() => editor.commands.clearSearch()} data-testid="clear-button">
            Clear
          </button>
          <span className="result-count" data-testid="result-count">
            {resultCount === 0 ? 'No results' : `${(currentIndex ?? 0) + 1} of ${resultCount}`}
          </span>
        </div>
      </div>
      <EditorContent editor={editor} />
    </>
  )
}
