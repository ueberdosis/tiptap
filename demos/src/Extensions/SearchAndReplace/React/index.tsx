import './styles.scss'

import { SearchAndReplace } from '@tiptap/extension-search-and-replace'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useCallback, useEffect, useRef, useState } from 'react'

interface SearchPanelProps {
  isVisible: boolean
  searchTerm: string
  replaceTerm: string
  caseSensitive: boolean
  resultsCount: number
  currentIndex: number
  inputRef: React.RefObject<HTMLInputElement | null>
  onSearchChange: (value: string) => void
  onReplaceChange: (value: string) => void
  onPrev: () => void
  onNext: () => void
  onReplace: () => void
  onReplaceAll: () => void
  onCaseToggle: (value: boolean) => void
  onClose: () => void
}

const SearchPanel: React.FC<SearchPanelProps> = ({
  isVisible,
  searchTerm,
  replaceTerm,
  caseSensitive,
  resultsCount,
  currentIndex,
  inputRef,
  onSearchChange,
  onReplaceChange,
  onPrev,
  onNext,
  onReplace,
  onReplaceAll,
  onCaseToggle,
  onClose,
}) => {
  if (!isVisible) {
    return null
  }

  const disabled = resultsCount === 0
  const label = resultsCount === 0 ? 'No results' : `${currentIndex + 1} / ${resultsCount}`

  return (
    <div className="search-panel" role="dialog" aria-label="Search and replace">
      <label className="field">
        <span>Search</span>
        <input
          ref={inputRef}
          className="search-input"
          placeholder="Search"
          value={searchTerm}
          onChange={event => onSearchChange(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault()
              onNext()
            }
          }}
        />
      </label>

      <label className="field">
        <span>Replace</span>
        <input
          className="replace-input"
          placeholder="Replace"
          value={replaceTerm}
          onChange={event => onReplaceChange(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault()
              onReplace()
            }
          }}
        />
      </label>

      <label className="case-sensitive">
        <input type="checkbox" checked={caseSensitive} onChange={event => onCaseToggle(event.target.checked)} />
        Case sensitive
      </label>

      <div className="controls">
        <span className="result-count">{label}</span>
        <div className="button-group">
          <button type="button" onClick={onPrev} title="Previous" disabled={disabled}>
            ←
          </button>
          <button type="button" onClick={onNext} title="Next" disabled={disabled}>
            →
          </button>
        </div>
        <div className="button-group">
          <button type="button" onClick={onReplace} title="Replace" disabled={disabled}>
            Replace
          </button>
          <button type="button" onClick={onReplaceAll} title="Replace all" disabled={disabled}>
            Replace All
          </button>
        </div>
      </div>

      <button className="close-panel" onClick={onClose} title="Close search">
        ×
      </button>
    </div>
  )
}

const SearchAndReplaceDemo: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const [resultsCount, setResultsCount] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const editor = useEditor({
    extensions: [StarterKit, SearchAndReplace],
    content: `
      <p>
        This is a small demo for the Search & Replace extension. Try searching for words like <strong>demo</strong>, <em>Search</em> or <u>replace</u>.
      </p>
      <p>
        Use <strong>Mod+F</strong> to open the search box.
      </p>
    `,
  })

  const syncFromStorage = useCallback(() => {
    if (!editor) {
      return
    }
    const storage = editor.storage.searchAndReplace
    if (!storage) {
      return
    }
    setResultsCount(storage.results.length)
    setCurrentIndex(storage.results.length ? storage.resultIndex : 0)
    setCaseSensitive(storage.caseSensitive)
  }, [editor])

  useEffect(() => {
    if (!editor) {
      return
    }

    const handleTransaction = () => syncFromStorage()
    editor.on('transaction', handleTransaction)
    syncFromStorage()

    return () => {
      editor.off('transaction', handleTransaction)
    }
  }, [editor, syncFromStorage])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault()
        setIsPanelOpen(true)
        window.requestAnimationFrame(() => inputRef.current?.select())
      }

      if (event.key === 'Escape' && isPanelOpen) {
        setIsPanelOpen(false)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isPanelOpen])

  useEffect(() => {
    if (!isPanelOpen) {
      return
    }
    const id = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(id)
  }, [isPanelOpen])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    editor.commands.setSearchTerm(value)
  }

  const handleReplaceChange = (value: string) => {
    setReplaceTerm(value)
  }

  const handlePrev = () => {
    editor.chain().previousSearchResult().run()
  }

  const handleNext = () => {
    editor.chain().nextSearchResult().run()
  }

  const handleReplace = () => {
    editor.chain().replace(replaceTerm).run()
  }

  const handleReplaceAll = () => {
    editor.chain().replaceAll(replaceTerm).run()
  }

  const handleCaseToggle = (value: boolean) => {
    setCaseSensitive(value)
    editor.commands.setCaseSensitive(value)
    if (searchTerm) {
      editor.commands.setSearchTerm(searchTerm)
    }
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
  }

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button className="open-search" onClick={() => setIsPanelOpen(value => !value)}>
            {isPanelOpen ? 'Hide Search' : 'Show Search'}
          </button>
        </div>
      </div>

      <SearchPanel
        isVisible={isPanelOpen}
        searchTerm={searchTerm}
        replaceTerm={replaceTerm}
        caseSensitive={caseSensitive}
        resultsCount={resultsCount}
        currentIndex={currentIndex}
        inputRef={inputRef}
        onSearchChange={handleSearchChange}
        onReplaceChange={handleReplaceChange}
        onPrev={handlePrev}
        onNext={handleNext}
        onReplace={handleReplace}
        onReplaceAll={handleReplaceAll}
        onCaseToggle={handleCaseToggle}
        onClose={handleClosePanel}
      />

      <div className="editor-wrapper">
        <EditorContent editor={editor} />
      </div>
    </>
  )
}

export default SearchAndReplaceDemo
