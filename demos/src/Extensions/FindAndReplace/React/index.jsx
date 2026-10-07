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
              disabled={useRegex}
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
