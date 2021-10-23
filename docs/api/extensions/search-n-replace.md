---
description: Search and Replace
icon: stack-line
---

# SearchNReplace

The `SearchNReplace` is extension for search and replace for tiptap v2.

## Installation

Until the package is published on NPM, you have to implement it from search-n-replace.ts

## Source code

[packages/extension-search-n-replace/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-search-n-replace/)

## Usage

Pass `SearchNReplace` to the editor to load all included extension at once.

```js
import { Editor } from "@tiptap/core";
import SearchNReplace from "./path/to/search-n-replace.ts/";

const editor = new Editor({
  content: "<p>Example Text</p>",
  extensions: [SearchNReplace],
});
```

You can configure the included extensions, or even disable a few of them, like shown below.

```js
import { Editor } from "@tiptap/core";
import SearchNReplace from "./path/to/search-n-replace.ts/";

const editor = new Editor({
  content: "<p>Example Text</p>",
  extensions: [
    StarterKit.configure({
      searchResultClass: "search-result", // class to give to found items. default 'search-result'
      caseSensitive: false, // no need to explain
      disableRegex: false, // also no need to explain
    }),
  ],
});
```
