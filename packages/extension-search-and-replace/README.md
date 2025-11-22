# @tiptap/extension-search-and-replace

Search and replace extension for Tiptap. Adds a ProseMirror plugin that highlights matches and exposes commands to navigate and replace matches.

Usage

```ts
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import SearchAndReplace from '@tiptap/extension-search-and-replace'

const editor = new Editor({
  extensions: [StarterKit, SearchAndReplace],
})

// set a search term
editor.commands.setSearchTerm('lorem')

// go to next result
editor.commands.nextSearchResult()

// replace current result
editor.commands.replace('ipsum')
```

Default CSS

Add simple styles to highlight results:

```css
.search-result {
  background: rgba(255, 229, 100, 0.5);
}
.search-result-current {
  outline: 2px solid #ffd54f;
}
```
