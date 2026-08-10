import './styles.scss'

import Document from '@tiptap/extension-document'
import FindAndReplace from '@tiptap/extension-find-and-replace'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'

import { useFindAndReplace } from './hooks/useFindAndReplace'

export default () => {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, FindAndReplace],
    content: `
      <p>
        Tiptap is a headless rich text editor that gives you full control over your editing experience. Built on ProseMirror, it provides a flexible framework for building custom editors without being tied to a specific UI. You can use it with React, Vue, or vanilla JavaScript.
      </p>
      <p>
        One of the best things about Tiptap is its extension system. You can add features like bold, italic, lists, or even custom nodes with just a few lines of code. The editor stays lightweight because you only include what you need. Each extension adds specific functionality to your editor.
      </p>
      <p>
        The community around Tiptap is growing fast. Developers love how easy it is to create collaborative editing experiences. Whether you are building a blog, a documentation site, or a complex content management system, Tiptap has the tools you need. The editor handles everything from simple text formatting to complex document structures.
      </p>
      <p>
        When you need to find and replace text in your document, Tiptap makes it simple. You can search for words, use regular expressions to find patterns, or even use capture groups to replace parts of matches. Try searching for "editor" to see how many times it appears, or use regex to find variations like "color" and "colour" at the same time.
      </p>
    `,
  })

  const {
    searchInput,
    replaceTerm,
    caseSensitive,
    useRegex,
    wholeWord,
    resultCount,
    currentIndex,
    setSearchTerm,
    setReplaceTerm,
    setCaseSensitive,
    setUseRegex,
    setWholeWord,
    goToNextResult,
    goToPreviousResult,
    replace,
    replaceAll,
    clearSearch,
    onSearchKeyDown,
  } = useFindAndReplace(editor)

  if (!editor) {
    return null
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <input
            type="text"
            placeholder="Search"
            aria-label="Search"
            value={searchInput}
            onChange={event => setSearchTerm(event.currentTarget.value)}
            onKeyDown={onSearchKeyDown}
            data-testid="search-input"
          />
          <input
            type="text"
            placeholder="Replace"
            aria-label="Replace"
            value={replaceTerm}
            onChange={event => setReplaceTerm(event.currentTarget.value)}
            data-testid="replace-input"
          />
          <label>
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={event => setCaseSensitive(event.currentTarget.checked)}
              data-testid="case-sensitive-checkbox"
            />
            Match case
          </label>
          <label>
            <input
              type="checkbox"
              checked={wholeWord}
              onChange={event => setWholeWord(event.currentTarget.checked)}
              data-testid="whole-word-checkbox"
            />
            Whole word
          </label>
          <label>
            <input
              type="checkbox"
              checked={useRegex}
              onChange={event => setUseRegex(event.currentTarget.checked)}
              data-testid="regex-checkbox"
            />
            Regex
          </label>
        </div>
        <div className="button-group">
          <button
            onClick={goToPreviousResult}
            disabled={resultCount === 0}
            data-testid="previous-button"
          >
            Previous
          </button>
          <button onClick={goToNextResult} disabled={resultCount === 0} data-testid="next-button">
            Next
          </button>
          <button onClick={replace} disabled={resultCount === 0} data-testid="replace-button">
            Replace
          </button>
          <button
            onClick={replaceAll}
            disabled={resultCount === 0}
            data-testid="replace-all-button"
          >
            Replace all
          </button>
          <button onClick={clearSearch} data-testid="clear-button">
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
