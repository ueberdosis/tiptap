# Configuration

## Table of Contents

## Introduction
tiptap is all about customization. There are a ton of options to configure the behavior and functionality of the editor. Most of those settings can be set before creating the Editor. Give tiptap a JSON with all the settings you would like to overwrite.

## Overwrite the default settings
See an example with `autoFocus: true` here:

```js
import { Editor } from '@tiptap/core'
import defaultExtensions from '@tiptap/starter-kit'

new Editor({
  element: document.getElementsByClassName('element'),
  extensions: defaultExtensions(),
  content: '<p>Hey there!</p>',
  autoFocus: true,
})
```

This will set the focus to tiptap after the editor is initialized. Of course, there are way more options available.

Check out the API documentation to see [all available options](/api/editor/).
