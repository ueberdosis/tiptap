---
description: Search and Replace
icon: stack-line
---

# SearchNReplace

The `SearchNReplace` is extension for search and replace for tiptap v2.

## Installation

Until the package is published on NPM, you have to implement it from search-n-replace.ts

## Commands

### setSearchTerm()
Set search term.

```js
editor.commands.setSearchTerm(searchTerm)
```

### setReplaceTerm()
Set replace term.

```js
editor.commands.setReplaceTerm(replaceTerm)
```

### replace()
Replace first instance of search results with `replaceTerm`.

```js
editor.commands.replace()
```

### replaceAll()
Replace all instance of search results with `replaceTerm`.

```js
editor.commands.replaceAll()
```

## Source code

[packages/extension-search-n-replace/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-search-n-replace/)

## Usage

Pass 'SearchNReplace' to the editor extensions.
You can configure which class should be added to the search results that are found and whether the search should be case-sensitive 
and whether regex search should be enabled or not.

```js
import { Editor } from "@tiptap/core";
import SearchNReplace from "./path/to/search-n-replace.ts/";

const editor = new Editor({
  content: "<p>Example Text</p>",
  extensions: [
    SearchNReplace.configure({
      searchResultClass: "search-result", // class to give to found items. default 'search-result'
      caseSensitive: false, // no need to explain
      disableRegex: false, // also no need to explain
    }),
  ],
});
```
