---
description: Ping all your people @marijn @kevin
icon: at-line
---

# Mention
[![Version](https://img.shields.io/npm/v/@tiptap/extension-mention.svg?label=version)](https://www.npmjs.com/package/@tiptap/extension-mention)
[![Downloads](https://img.shields.io/npm/dm/@tiptap/extension-mention.svg)](https://npmcharts.com/compare/@tiptap/extension-mention?minimal=true)

Honestly, the mention node is amazing. It adds support for `@mentions`, for example to ping users, *and* provides full control over the rendering.

Literally everything can be customized. You can pass a custom component for the rendering.  All examples use `.filter()` to search through items, but feel free to send async queries to an API or add a more advanced library like [fuse.js](https://fusejs.io/) to your project.

## Installation
```bash
# with npm
npm install @tiptap/extension-mention

# with Yarn
yarn add @tiptap/extension-mention
```

## Dependencies
To place the popups correctly, we’re using [tippy.js](https://atomiks.github.io/tippyjs/) in all our examples. You are free to bring your own library, but if you’re fine with it, just install what we use:

```bash
# with npm
npm install tippy.js

# with Yarn
yarn add tippy.js
```

## Settings

### HTMLAttributes
Custom HTML attributes that should be added to the rendered HTML tag.

```js
Mention.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

### renderLabel
Define how a mention label should be rendered.

```js
Mention.configure({
  renderLabel({ options, node }) {
    return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
  }
})
```

### suggestion
[Read more](/api/utilities/suggestion)

```js
Mention.configure({
  suggestion: {
    // …
  },
})
```

## Source code
[packages/extension-mention/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-mention/)

## Usage
https://embed.tiptap.dev/preview/Nodes/Mention
