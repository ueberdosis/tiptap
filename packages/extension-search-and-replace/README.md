# @tiptap/extension-search-and-replace

Search and replace extension for Tiptap. Adds a ProseMirror plugin that highlights matches and exposes commands to navigate and replace matches.

## Installation

```bash
npm install @tiptap/extension-search-and-replace
```

## Usage

### Basic Setup

```ts
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import SearchAndReplace from '@tiptap/extension-search-and-replace'

const editor = new Editor({
  extensions: [StarterKit, SearchAndReplace],
})

// Set a search term
editor.commands.setSearchTerm('lorem')

// Navigate through results
editor.commands.nextSearchResult()
editor.commands.previousSearchResult()

// Replace current result
editor.commands.replace('ipsum')

// Replace all matches
editor.commands.replaceAll('ipsum')

// Clear search
editor.commands.clearSearch()
```

### Configuration

The extension accepts the following options:

```ts
SearchAndReplace.configure({
  searchResultClass: 'search-result',
  searchResultCurrentClass: 'search-result-current',
  disableBrowserSearch: false,
  caseSensitive: false,
  searchDebounce: 300,
})
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `searchResultClass` | `string` | `'search-result'` | CSS class applied to all search result matches |
| `searchResultCurrentClass` | `string` | `'search-result-current'` | CSS class applied to the currently selected match |
| `disableBrowserSearch` | `boolean` | `false` | Whether to disable the browser's native search |
| `caseSensitive` | `boolean` | `false` | Whether searches should be case-sensitive by default |
| `searchDebounce` | `number` | `300` | Debounce delay in milliseconds for search operations |

## Commands

### setSearchTerm

Set the search term and highlight all matches in the document.

```ts
editor.commands.setSearchTerm('search term')
```

### clearSearch

Clear the current search term and remove all highlights.

```ts
editor.commands.clearSearch()
```

### nextSearchResult

Navigate to the next search result. Wraps around to the first result when reaching the end.

```ts
editor.commands.nextSearchResult()
```

### previousSearchResult

Navigate to the previous search result. Wraps around to the last result when reaching the beginning.

```ts
editor.commands.previousSearchResult()
```

### replace

Replace the currently selected search result with the provided text.

```ts
editor.commands.replace('replacement text')
```

### replaceAll

Replace all search results with the provided text.

```ts
editor.commands.replaceAll('replacement text')
```

### setCaseSensitive

Toggle case-sensitive search mode.

```ts
editor.commands.setCaseSensitive(true)
```

## Storage

The extension exposes storage that can be accessed to track search state:

```ts
const storage = editor.storage.searchAndReplace

// Current search term
console.log(storage.searchTerm)

// Array of search results with positions
console.log(storage.results)

// Current result index
console.log(storage.resultIndex)

// Case sensitivity setting
console.log(storage.caseSensitive)
```

### Storage Properties

| Property | Type | Description |
|----------|------|-------------|
| `searchTerm` | `string` | The current search term |
| `results` | `SearchResult[]` | Array of all matches with `from` and `to` positions |
| `resultIndex` | `number` | Index of the currently selected result |
| `lastSearchTerm` | `string` | The last processed search term (used for change detection) |
| `caseSensitive` | `boolean` | Current case-sensitivity setting |

## Styling

Add CSS to highlight search results. The extension applies classes to matched text via decorations.

```css
.search-result {
  background-color: rgba(255, 229, 100, 0.5);
  border-radius: 2px;
}

.search-result-current {
  background-color: rgba(255, 229, 100, 0.5);
  outline: 2px solid #ffd54f;
  border-radius: 3px;
}
```

For Vue 3 components with scoped styles, use the `:deep()` selector:

```vue
<style scoped>
:deep(.search-result) {
  background-color: rgba(255, 229, 100, 0.5);
  border-radius: 2px;
}

:deep(.search-result-current) {
  background-color: rgba(255, 229, 100, 0.5);
  outline: 2px solid #ffd54f;
  border-radius: 3px;
}
</style>
```

## Example Implementation

See the demo implementations in the repository:

- React: `demos/src/Extensions/SearchAndReplace/React/`
- Vue: `demos/src/Extensions/SearchAndReplace/Vue/`

### Building a Search UI

Here's a minimal example of building a search interface:

```ts
import { useEditor } from '@tiptap/react'
import { SearchAndReplace } from '@tiptap/extension-search-and-replace'
import { useState, useEffect } from 'react'

function SearchPanel() {
  const [searchTerm, setSearchTerm] = useState('')
  const [resultsCount, setResultsCount] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)

  const editor = useEditor({
    extensions: [StarterKit, SearchAndReplace],
  })

  useEffect(() => {
    if (!editor) return

    const updateResults = () => {
      const storage = editor.storage.searchAndReplace
      setResultsCount(storage.results.length)
      setCurrentIndex(storage.resultIndex)
    }

    editor.on('transaction', updateResults)
    return () => editor.off('transaction', updateResults)
  }, [editor])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    editor?.commands.setSearchTerm(value)
  }

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search..."
      />
      <button onClick={() => editor?.commands.previousSearchResult()}>
        Previous
      </button>
      <button onClick={() => editor?.commands.nextSearchResult()}>
        Next
      </button>
      <span>{resultsCount ? `${currentIndex + 1} / ${resultsCount}` : 'No results'}</span>
    </div>
  )
}
```

## How It Works

The extension uses a ProseMirror plugin that:

1. Listens for search term changes via commands
2. Searches the document for matches using regular expressions
3. Creates inline decorations to highlight matches
4. Tracks the current result index for navigation
5. Updates decorations when navigating between results
6. Handles document changes by remapping result positions
7. Debounces search operations to improve performance

Search operations are debounced by default (300ms) to prevent excessive re-computation when typing quickly.
